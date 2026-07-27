import prisma from '../../../infrastructure/db/prisma';
import { IFixedCostRepository } from '../../ports/ifixed-cost-repository';

export interface BreakEvenResult {
  /** Total de custo fixo do mês corrente. */
  monthlyFixedTotal: number;
  /** Margem de contribuição acumulada este mês (soma das CM dos atendimentos já confirmados). */
  contributionSoFar: number;
  /** Quanto ainda precisa ser coberto por atendimentos futuros. */
  needed: number;
  /** Margem de contribuição média por atendimento — base do cálculo. */
  avgContributionPerService: number;
  /**
   * Base usada pra calcular a média:
   *   - 'current_month'   → só o mês corrente
   *   - 'last_3_months'   → média dos 3 meses fechados anteriores
   *   - 'insufficient'    → não há dados suficientes; response inclui avg=0 e missing=null.
   */
  avgSource: 'current_month' | 'last_3_months' | 'insufficient';
  /** Quantos atendimentos faltam.  Null quando avgSource='insufficient'. */
  missingServices: number | null;
}

/**
 * Contribution margin (CM) por atendimento:
 *   CM = totalPrice − insumoCost − laborCost − paymentFee − commission
 *
 * A CM é o quanto cada atendimento contribui pra cobrir o custo fixo do
 * negócio.  Rateio (`fixed_cost_frozen`) NÃO entra na conta aqui — ele é
 * a fatia do custo fixo que aquele atendimento já "puxou" via snapshot.
 * Somando CM até bater o custo fixo total, a gente cobre o mês.
 *
 * Serviços legados sem snapshot (`net_profit_frozen` NULL) são ignorados —
 * eles têm status='confirmed' mas nenhum dado financeiro pra somar.
 */
export class GetBreakEvenUseCase {
  constructor(private fixedCostRepo: IFixedCostRepository) {}

  async execute(businessId: number, referenceDate = new Date()): Promise<BreakEvenResult> {
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const monthEnd = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const monthlyFixedTotal = await this.fixedCostRepo.totalMonthlyForBusiness(
      businessId,
      referenceDate,
    );

    // Attendances confirmed this month, with the frozen snapshot fields.
    const thisMonth = await prisma.service.findMany({
      where: {
        businessId,
        status: 'confirmed',
        deletedAt: null,
        date: { gte: monthStart, lte: monthEnd },
        netProfitFrozen: { not: null },
      },
      select: {
        totalPrice: true,
        insumoCostFrozen: true,
        laborCostFrozen: true,
        paymentFeeFrozen: true,
        commissionFrozen: true,
      },
    });

    const contributionSoFar = round2(
      thisMonth.reduce((acc, s) => acc + this.contributionMargin(s), 0),
    );

    const needed = Math.max(0, round2(monthlyFixedTotal - contributionSoFar));

    // Choose divisor source for avg CM per service.
    let avgContributionPerService = 0;
    let avgSource: BreakEvenResult['avgSource'] = 'insufficient';

    if (thisMonth.length >= 5) {
      // Enough activity this month — use it.
      avgContributionPerService = round2(contributionSoFar / thisMonth.length);
      avgSource = 'current_month';
    } else {
      // Fall back to last 3 closed months.
      const threeMonthsAgoStart = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth() - 3,
        1,
      );
      const lastClosedMonthEnd = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      const history = await prisma.service.findMany({
        where: {
          businessId,
          status: 'confirmed',
          deletedAt: null,
          date: { gte: threeMonthsAgoStart, lte: lastClosedMonthEnd },
          netProfitFrozen: { not: null },
        },
        select: {
          totalPrice: true,
          insumoCostFrozen: true,
          laborCostFrozen: true,
          paymentFeeFrozen: true,
          commissionFrozen: true,
        },
      });
      if (history.length >= 3) {
        const totalCM = history.reduce((acc, s) => acc + this.contributionMargin(s), 0);
        avgContributionPerService = round2(totalCM / history.length);
        avgSource = 'last_3_months';
      }
    }

    const missingServices =
      avgContributionPerService > 0 ? Math.ceil(needed / avgContributionPerService) : null;

    return {
      monthlyFixedTotal: round2(monthlyFixedTotal),
      contributionSoFar,
      needed,
      avgContributionPerService,
      avgSource,
      missingServices,
    };
  }

  private contributionMargin(s: {
    totalPrice: any;
    insumoCostFrozen: any;
    laborCostFrozen: any;
    paymentFeeFrozen: any;
    commissionFrozen: any;
  }): number {
    const total = Number(s.totalPrice);
    const insumo = Number(s.insumoCostFrozen ?? 0);
    const labor = Number(s.laborCostFrozen ?? 0);
    const fee = Number(s.paymentFeeFrozen ?? 0);
    const commission = Number(s.commissionFrozen ?? 0);
    return total - insumo - labor - fee - commission;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
