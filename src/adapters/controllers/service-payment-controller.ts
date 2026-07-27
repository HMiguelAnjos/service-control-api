import { NextFunction, Request, Response } from 'express';
import {
  ServicePaymentRow,
  CashFlowSummary,
} from '../../application/ports/iservice-payment-repository';
import { ReceiveServicePaymentUseCase } from '../../application/use-cases/service-payment/receive-service-payment-use-case';
import { ClearServicePaymentUseCase } from '../../application/use-cases/service-payment/clear-service-payment-use-case';
import { GetCashFlowProjectionUseCase } from '../../application/use-cases/service-payment/get-cash-flow-projection-use-case';
import { ListDivergencesUseCase } from '../../application/use-cases/service-payment/list-divergences-use-case';
import { ListServicePaymentsUseCase } from '../../application/use-cases/service-payment/list-service-payments-use-case';
import { ForbiddenError, ValidationError } from '../../middlewares/errors/errors';

function requireBusinessId(req: Request): number {
  const id = req.user?.businessId;
  if (!id) {
    throw new ForbiddenError(
      'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
    );
  }
  return id;
}

function parseDate(input: unknown, field: string): Date {
  if (typeof input !== 'string') throw new ValidationError(`${field} inválida.`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}
function parseOptionalDate(input: unknown, field: string): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  return parseDate(input, field);
}

function serialiseRow(r: ServicePaymentRow) {
  const nowMs = Date.now();
  const isOverdue = !r.actualReceiptAt && r.expectedReceiptAt.getTime() < nowMs;
  const divergence =
    r.actualAmount != null ? Math.round((r.actualAmount - r.netAmount) * 100) / 100 : null;
  return {
    id: r.id,
    serviceId: r.serviceId,
    paymentMethodId: r.paymentMethodId,
    paymentMethodName: r.paymentMethodName,
    clientName: r.clientName,
    amount: r.amount,
    feePercent: r.feePercent,
    feeAmount: r.feeAmount,
    netAmount: r.netAmount,
    expectedReceiptAt: r.expectedReceiptAt.toISOString(),
    actualReceiptAt: r.actualReceiptAt?.toISOString() ?? null,
    actualAmount: r.actualAmount,
    divergence,
    status: r.actualReceiptAt ? 'received' : isOverdue ? 'overdue' : 'pending',
  };
}

function serialiseSummary(s: CashFlowSummary) {
  return {
    now: s.now.toISOString(),
    receivedThisMonth: s.receivedThisMonth,
    expectedThisMonthRemaining: s.expectedThisMonthRemaining,
    overdue: s.overdue,
    buckets: s.buckets.map((b) => ({
      key: b.key,
      endDate: b.endDate.toISOString(),
      expectedNet: b.expectedNet,
      count: b.count,
    })),
  };
}

export class ServicePaymentController {
  constructor(
    private receiveUC: ReceiveServicePaymentUseCase,
    private clearUC: ClearServicePaymentUseCase,
    private cashFlowUC: GetCashFlowProjectionUseCase,
    private divergencesUC: ListDivergencesUseCase,
    private listUC: ListServicePaymentsUseCase,
  ) {}

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const status = (req.query.status as any) ?? undefined;
      const items = await this.listUC.execute({
        businessId,
        from: parseOptionalDate(req.query.from, 'from'),
        to: parseOptionalDate(req.query.to, 'to'),
        status,
      });
      return res.json(items.map(serialiseRow));
    } catch (err) {
      next(err);
    }
  }

  async receive(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const body = req.body ?? {};
      const actualAmount = Number(body.actualAmount);
      if (!Number.isFinite(actualAmount)) throw new ValidationError('actualAmount obrigatório.');
      const result = await this.receiveUC.execute({
        id,
        businessId,
        actualAmount,
        actualReceiptAt: parseOptionalDate(body.actualReceiptAt, 'actualReceiptAt'),
      });
      return res.json({ ...serialiseRow(result.row), divergence: result.divergence });
    } catch (err) {
      next(err);
    }
  }

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const row = await this.clearUC.execute(id, businessId);
      return res.json(serialiseRow(row));
    } catch (err) {
      next(err);
    }
  }

  async cashFlow(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const raw = req.query.buckets;
      let buckets: number[] | undefined;
      if (typeof raw === 'string') {
        buckets = raw
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isFinite(n) && n > 0);
      }
      const summary = await this.cashFlowUC.execute(businessId, buckets ?? [7, 15, 30]);
      return res.json(serialiseSummary(summary));
    } catch (err) {
      next(err);
    }
  }

  async divergences(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const items = await this.divergencesUC.execute(businessId);
      return res.json(items.map(serialiseRow));
    } catch (err) {
      next(err);
    }
  }
}
