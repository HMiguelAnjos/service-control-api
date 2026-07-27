import prisma from '../../../infrastructure/db/prisma';
import { IProfessionalRepository } from '../../ports/iprofessional-repository';
import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';
import { RateioCalculator } from '../../services/rateio-calculator';
import {
  computeServiceSnapshot,
  SnapshotInsumo,
  SnapshotPayment,
} from '../../services/service-snapshot-calculator';
import {
  ConflictError,
  InsufficientStockError,
  NotFoundError,
  ValidationError,
} from '../../../middlewares/errors/errors';

export interface ConfirmServiceInput {
  serviceId: number;
  businessId: number;

  /** Real consumption per service_product line (user may adjust the suggested amount). */
  productLines: Array<{ productId: number; realQuantity: number }>;

  /** Real duration of the service (minutes).  Falls back to `service.durationMinutes`. */
  durationMinutes?: number | null;

  /** Payment split.  Sum(amount) must equal the service total price. */
  payments: Array<{ paymentMethodId: number; amount: number }>;

  /** Optional override of the total price at confirm time (e.g. discount). */
  totalPrice?: number;
}

export interface ConfirmedService {
  id: number;
  status: 'confirmed';
  totalPrice: number;
  snapshot: {
    insumoCost: number;
    laborCost: number;
    fixedCost: number;
    fixedCostDivisor: number;
    paymentFee: number;
    commission: number;
    netProfit: number;
    marginPct: number;
  };
  payments: Array<{
    id: number;
    paymentMethodId: number;
    amount: number;
    feeAmount: number;
    netAmount: number;
    expectedReceiptAt: string;
  }>;
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}
function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

export class ConfirmServiceUseCase {
  constructor(
    private professionalRepo: IProfessionalRepository,
    private paymentMethodRepo: IPaymentMethodRepository,
    private rateio: RateioCalculator,
  ) {}

  async execute(input: ConfirmServiceInput): Promise<ConfirmedService> {
    // 1. Load the draft with everything we need to freeze.
    const draft = await prisma.service.findFirst({
      where: { id: input.serviceId, businessId: input.businessId, deletedAt: null },
      include: {
        service_products: {
          where: { deletedAt: null },
          include: { product: { include: { inventory: true } } },
        },
        procedures: true,
      },
    });
    if (!draft) throw new NotFoundError('Atendimento');
    if (draft.status !== 'draft') {
      throw new ConflictError('Atendimento já foi confirmado — snapshot é imutável.');
    }

    const totalPrice = input.totalPrice ?? Number(draft.totalPrice);
    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      throw new ValidationError('Preço total inválido.');
    }

    // 2. Validate payment split matches total.
    const paymentSum = input.payments.reduce((acc, p) => acc + p.amount, 0);
    if (Math.abs(paymentSum - totalPrice) > 0.01) {
      throw new ValidationError(
        `Soma dos pagamentos (${paymentSum.toFixed(2)}) diferente do total do atendimento (${totalPrice.toFixed(2)}).`,
      );
    }

    // 3. Load payment methods (all in one query for the split).
    const paymentMethodIds = [...new Set(input.payments.map((p) => p.paymentMethodId))];
    const paymentMethods = await Promise.all(
      paymentMethodIds.map((id) => this.paymentMethodRepo.findOne(id, input.businessId)),
    );
    const pmMap = new Map<number, { feePercent: number; receiptDays: number }>();
    for (let i = 0; i < paymentMethodIds.length; i++) {
      const pm = paymentMethods[i];
      if (!pm) throw new NotFoundError(`Forma de pagamento #${paymentMethodIds[i]}`);
      pmMap.set(paymentMethodIds[i], { feePercent: pm.feePercent, receiptDays: pm.receiptDays });
    }

    // 4. Resolve professional & commission percent (rule 10 — over profit).
    let hourlyCost: number | null = null;
    let commissionPercent: number | null = null;
    if (draft.professionalId) {
      const prof = await this.professionalRepo.findOne(draft.professionalId, input.businessId);
      if (prof) {
        hourlyCost = prof.hourlyCost;
        commissionPercent = await this.professionalRepo.getCommissionPercentAt(
          draft.professionalId,
          draft.date,
        );
      }
    }

    // 5. Match input.productLines against the draft's service_products.
    const productLineMap = new Map(input.productLines.map((l) => [l.productId, l.realQuantity]));
    const insumos: SnapshotInsumo[] = draft.service_products.map((sp) => {
      const realQuantity = productLineMap.has(sp.productId)
        ? productLineMap.get(sp.productId)!
        : Number(sp.quantity); // sem override → mantém o sugerido
      if (realQuantity < 0) {
        throw new ValidationError(
          `Quantidade real de produto #${sp.productId} não pode ser negativa.`,
        );
      }
      return {
        productId: sp.productId,
        quantity: realQuantity,
        unitCost: Number(sp.product.unitCost),
      };
    });

    // 6. Rateio.
    const rateio = await this.rateio.calculate(input.businessId, draft.date);

    // 7. Snapshot.
    const snapshot = computeServiceSnapshot({
      totalPrice,
      insumos,
      durationMinutes: input.durationMinutes ?? draft.durationMinutes,
      hourlyCost,
      fixedCostRateio: rateio.amount,
      payments: input.payments.map((p) => ({
        amount: p.amount,
        feePercent: pmMap.get(p.paymentMethodId)!.feePercent,
      })),
      commissionPercent,
    });

    // 8. Pre-flight: does inventory hold enough for the real consumption?
    for (const insumo of insumos) {
      if (insumo.quantity <= 0) continue;
      const sp = draft.service_products.find((s) => s.productId === insumo.productId)!;
      const available = sp.product.inventory ? Number(sp.product.inventory.quantity) : 0;
      if (available < insumo.quantity) {
        throw new InsufficientStockError({
          productId: insumo.productId,
          productName: sp.product.name,
          requested: insumo.quantity,
          available,
        });
      }
    }

    // 9. All changes in one transaction.
    const now = new Date();
    const persistedPayments = await prisma.$transaction(async (tx) => {
      // 9a. Update service_product real quantities + freeze unit cost.
      for (const insumo of insumos) {
        await tx.service_product.updateMany({
          where: { serviceId: draft.id, productId: insumo.productId, deletedAt: null },
          data: {
            quantity: insumo.quantity,
            unitCostFrozen: insumo.unitCost,
          },
        });
      }

      // 9b. Deduct inventory (real consumption only).
      for (const insumo of insumos) {
        if (insumo.quantity <= 0) continue;
        await tx.inventory.updateMany({
          where: { productId: insumo.productId, deletedAt: null },
          data: { quantity: { decrement: insumo.quantity } },
        });
      }

      // 9c. Freeze snapshot on service + flip status.
      await tx.service.update({
        where: { id: draft.id },
        data: {
          status: 'confirmed',
          totalPrice,
          durationMinutes: input.durationMinutes ?? draft.durationMinutes,
          insumoCostFrozen: snapshot.insumoCost,
          laborCostFrozen: snapshot.laborCost,
          fixedCostFrozen: snapshot.fixedCost,
          paymentFeeFrozen: snapshot.paymentFee,
          commissionFrozen: snapshot.commission,
          netProfitFrozen: snapshot.netProfit,
          marginPctFrozen: snapshot.marginPct,
          fixedCostDivisor: rateio.divisor,
        },
      });

      // 9d. Mirror to legacy `profit` table so existing dashboards keep working.
      await tx.profit.upsert({
        where: { serviceId: draft.id },
        create: {
          serviceId: draft.id,
          totalProfit: snapshot.netProfit,
          marginPct: snapshot.marginPct,
        },
        update: {
          totalProfit: snapshot.netProfit,
          marginPct: snapshot.marginPct,
        },
      });

      // 9e. Persist the payment split with expected receipts.
      const paymentRows = [];
      for (const p of input.payments) {
        const pm = pmMap.get(p.paymentMethodId)!;
        const feeAmount = roundCents((p.amount * pm.feePercent) / 100);
        const netAmount = roundCents(p.amount - feeAmount);
        const expectedReceiptAt = addDays(draft.date, pm.receiptDays);

        const row = await tx.service_payment.create({
          data: {
            serviceId: draft.id,
            paymentMethodId: p.paymentMethodId,
            amount: p.amount,
            feePercent: pm.feePercent,
            feeAmount,
            netAmount,
            expectedReceiptAt,
          },
        });
        paymentRows.push(row);
      }
      return paymentRows;
    });

    return {
      id: draft.id,
      status: 'confirmed',
      totalPrice,
      snapshot: {
        insumoCost: snapshot.insumoCost,
        laborCost: snapshot.laborCost,
        fixedCost: snapshot.fixedCost,
        fixedCostDivisor: rateio.divisor,
        paymentFee: snapshot.paymentFee,
        commission: snapshot.commission,
        netProfit: snapshot.netProfit,
        marginPct: snapshot.marginPct,
      },
      payments: persistedPayments.map((p) => ({
        id: p.id,
        paymentMethodId: p.paymentMethodId,
        amount: Number(p.amount),
        feeAmount: Number(p.feeAmount),
        netAmount: Number(p.netAmount),
        expectedReceiptAt: p.expectedReceiptAt.toISOString(),
      })),
    };

    // Reference `now` so it's not tree-shaken away — used implicitly via draft.date.
    void now;
  }
}
