import prisma from '../../infrastructure/db/prisma';
import { IFixedCostRepository } from '../ports/ifixed-cost-repository';

export interface RateioResult {
  /** Rateio congelado no snapshot: total_fixo_do_mês / divisor. */
  amount: number;
  /** Divisor usado.  Guardado no service pra auditoria. */
  divisor: number;
  /** Como o divisor foi obtido — útil pra explicar no dashboard. */
  divisorSource: 'history' | 'estimate' | 'default';
  /** Total mensal de custos fixos que serviu de base do cálculo. */
  monthlyFixedTotal: number;
}

/**
 * Q3: divisor é a média de atendimentos dos últimos 3 meses (fechados).
 * Se não houver 3 meses de dados, usa `business.monthlyServiceEstimate`
 * como fallback (usuário informa no onboarding).  Se nem isso existir,
 * cai num default sensato (30 atendimentos/mês).
 */
const HISTORY_MONTHS = 3;
const DEFAULT_ESTIMATE = 30;

function firstDayOfMonthAgo(months: number): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - months, 1, 0, 0, 0, 0);
}
function lastDayOfMonthAgo(months: number): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - months + 1, 0, 23, 59, 59, 999);
}

export class RateioCalculator {
  constructor(private fixedCostRepo: IFixedCostRepository) {}

  async calculate(businessId: number, referenceDate: Date): Promise<RateioResult> {
    const monthlyFixedTotal = await this.fixedCostRepo.totalMonthlyForBusiness(
      businessId,
      referenceDate,
    );

    const { divisor, divisorSource } = await this.resolveDivisor(businessId);

    const amount =
      monthlyFixedTotal > 0 && divisor > 0
        ? Math.round((monthlyFixedTotal / divisor) * 100) / 100
        : 0;

    return { amount, divisor, divisorSource, monthlyFixedTotal };
  }

  private async resolveDivisor(
    businessId: number,
  ): Promise<{ divisor: number; divisorSource: RateioResult['divisorSource'] }> {
    // 1. Try 3-month history: count confirmed services in the last 3
    //    closed months (not the current month, which is still in progress).
    const from = firstDayOfMonthAgo(HISTORY_MONTHS);
    const to = lastDayOfMonthAgo(1);
    const historicalCount = await prisma.service.count({
      where: {
        businessId,
        status: 'confirmed',
        deletedAt: null,
        date: { gte: from, lte: to },
      },
    });
    // Require at least one service per month on average — otherwise
    // history is too thin to trust and we fall back to the estimate.
    if (historicalCount >= HISTORY_MONTHS) {
      return {
        divisor: Math.round(historicalCount / HISTORY_MONTHS),
        divisorSource: 'history',
      };
    }

    // 2. Fall back to the business's manual estimate (onboarding input).
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { monthlyServiceEstimate: true },
    });
    if (business?.monthlyServiceEstimate && business.monthlyServiceEstimate > 0) {
      return {
        divisor: business.monthlyServiceEstimate,
        divisorSource: 'estimate',
      };
    }

    // 3. Last-resort default.  The onboarding wizard (phase 8) will make
    //    sure users never actually land here.
    return { divisor: DEFAULT_ESTIMATE, divisorSource: 'default' };
  }
}
