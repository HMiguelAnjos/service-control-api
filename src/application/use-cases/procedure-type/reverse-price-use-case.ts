import prisma from '../../../infrastructure/db/prisma';
import { RateioCalculator } from '../../services/rateio-calculator';
import { IProfessionalRepository } from '../../ports/iprofessional-repository';
import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export interface ReversePriceInput {
  businessId: number;
  procedureTypeId: number;
  /** Margem líquida desejada em % (ex.: 20 = 20%). */
  desiredMarginPct: number;
  /** Método de pagamento no qual o cliente vai pagar (define a taxa). */
  paymentMethodId: number;
  /** Profissional que vai executar (define comissão + custo/hora). */
  professionalId?: number | null;
  /** Duração real (min).  Se omitido usa `procedure_type.default_duration_minutes`. */
  durationMinutes?: number | null;
}

export interface ReversePriceResult {
  suggestedPrice: number;
  breakdown: {
    insumoCost: number;
    laborCost: number;
    fixedCost: number;
    paymentFee: number;
    commission: number;
    netProfit: number;
    marginPct: number;
  };
  divisor: number;
  divisorSource: 'history' | 'estimate' | 'default';
  monthlyFixedTotal: number;
  warnings: string[];
}

/**
 * Given a procedure and a desired margin, compute the sell price that
 * would yield that margin at today's costs.  Formula:
 *
 *   Let V = insumo + labor + rateio          (fixed portion in $)
 *       f = fee_percent / 100
 *       c = commission_percent / 100
 *       m = desired_margin_pct / 100
 *
 *   marginPct = (1 − c) · (1 − f − V/price)
 *
 *   Solving for `price`:
 *     price = V / (1 − f − m / (1 − c))
 *
 * If the denominator is ≤ 0, the desired margin is unreachable with the
 * chosen payment method + commission (fees + commission eat more than
 * the margin allows).  Response returns suggestedPrice = 0 and a warning.
 */
export class ReversePriceUseCase {
  constructor(
    private rateio: RateioCalculator,
    private professionalRepo: IProfessionalRepository,
    private paymentMethodRepo: IPaymentMethodRepository,
  ) {}

  async execute(input: ReversePriceInput): Promise<ReversePriceResult> {
    if (!Number.isFinite(input.desiredMarginPct)) {
      throw new ValidationError('desiredMarginPct inválido.');
    }
    if (input.desiredMarginPct < 0 || input.desiredMarginPct >= 100) {
      throw new ValidationError(
        'desiredMarginPct precisa ficar entre 0 (inclusive) e 100 (exclusive).',
      );
    }

    const procedureType = await prisma.procedure_type.findFirst({
      where: { id: input.procedureTypeId, businessId: input.businessId, deletedAt: null },
      include: {
        products: {
          where: { deletedAt: null },
          include: { product: true },
        },
      },
    });
    if (!procedureType) throw new NotFoundError('Procedimento');

    const paymentMethod = await this.paymentMethodRepo.findOne(
      input.paymentMethodId,
      input.businessId,
    );
    if (!paymentMethod) throw new NotFoundError('Forma de pagamento');

    // Insumo cost: use the current weighted-average unit cost.
    const insumoCost = round2(
      procedureType.products.reduce(
        (acc, ptp) => acc + Number(ptp.quantity) * Number(ptp.product.unitCost),
        0,
      ),
    );

    // Labor cost.
    const duration = input.durationMinutes ?? procedureType.defaultDurationMinutes ?? 0;
    let hourlyCost = 0;
    let commissionPercent = 0;
    if (input.professionalId) {
      const prof = await this.professionalRepo.findOne(input.professionalId, input.businessId);
      if (!prof) throw new NotFoundError('Profissional');
      hourlyCost = prof.hourlyCost ?? 0;
      commissionPercent =
        (await this.professionalRepo.getCommissionPercentAt(input.professionalId, new Date())) ?? 0;
    }
    const laborCost = round2((duration / 60) * hourlyCost);

    // Rateio (today's).
    const rateioRes = await this.rateio.calculate(input.businessId, new Date());

    // Solve for price.
    const V = insumoCost + laborCost + rateioRes.amount;
    const f = paymentMethod.feePercent / 100;
    const c = commissionPercent / 100;
    const m = input.desiredMarginPct / 100;

    const denominator = 1 - f - m / (1 - c);
    const warnings: string[] = [];

    if (denominator <= 0) {
      warnings.push(
        `Margem de ${input.desiredMarginPct.toFixed(1)}% é inatingível com essa combinação: ` +
          `taxa ${paymentMethod.feePercent}% + comissão ${(c * 100).toFixed(1)}% ` +
          `consomem todo o espaço disponível.  Reduza a margem, mude a forma de pagamento ou revise a comissão.`,
      );
      return {
        suggestedPrice: 0,
        breakdown: {
          insumoCost,
          laborCost,
          fixedCost: round2(rateioRes.amount),
          paymentFee: 0,
          commission: 0,
          netProfit: 0,
          marginPct: 0,
        },
        divisor: rateioRes.divisor,
        divisorSource: rateioRes.divisorSource,
        monthlyFixedTotal: rateioRes.monthlyFixedTotal,
        warnings,
      };
    }

    const suggestedPrice = round2(V / denominator);

    // Rebuild the full breakdown so the front can show the numbers.
    const paymentFee = round2(suggestedPrice * f);
    const profitBeforeCommission = round2(
      suggestedPrice - insumoCost - laborCost - rateioRes.amount - paymentFee,
    );
    const commission = round2(profitBeforeCommission * c);
    const netProfit = round2(profitBeforeCommission - commission);
    const marginPct = suggestedPrice > 0 ? round3((netProfit / suggestedPrice) * 100) : 0;

    if (procedureType.finalValue != null && Number(procedureType.finalValue) > 0) {
      const current = Number(procedureType.finalValue);
      if (Math.abs(current - suggestedPrice) / current > 0.2) {
        warnings.push(
          `Preço sugerido (R$ ${suggestedPrice.toFixed(2)}) difere em mais de 20% do preço atual (R$ ${current.toFixed(2)}). ` +
            `Verifique custos antes de reajustar.`,
        );
      }
    }

    return {
      suggestedPrice,
      breakdown: {
        insumoCost,
        laborCost,
        fixedCost: round2(rateioRes.amount),
        paymentFee,
        commission,
        netProfit,
        marginPct,
      },
      divisor: rateioRes.divisor,
      divisorSource: rateioRes.divisorSource,
      monthlyFixedTotal: rateioRes.monthlyFixedTotal,
      warnings,
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
