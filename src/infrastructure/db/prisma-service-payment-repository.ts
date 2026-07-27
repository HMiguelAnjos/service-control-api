import prisma from './prisma';
import {
  IServicePaymentRepository,
  ServicePaymentRow,
  CashFlowBucket,
  CashFlowSummary,
} from '../../application/ports/iservice-payment-repository';
import { NotFoundError } from '../../middlewares/errors/errors';

function toRow(r: any): ServicePaymentRow {
  return {
    id: r.id,
    serviceId: r.serviceId,
    paymentMethodId: r.paymentMethodId,
    paymentMethodName: r.paymentMethod?.name ?? '',
    clientName: r.service?.client?.name ?? '',
    amount: Number(r.amount),
    feePercent: Number(r.feePercent),
    feeAmount: Number(r.feeAmount),
    netAmount: Number(r.netAmount),
    expectedReceiptAt: r.expectedReceiptAt,
    actualReceiptAt: r.actualReceiptAt,
    actualAmount: r.actualAmount != null ? Number(r.actualAmount) : null,
  };
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * All queries here scope to the business by joining through
 * `service.businessId` — service_payment itself has no business_id
 * column (it inherits tenant via the service it belongs to).
 */
export class PrismaServicePaymentRepository implements IServicePaymentRepository {
  async findOne(id: number, businessId: number): Promise<ServicePaymentRow | null> {
    const r = await prisma.service_payment.findFirst({
      where: { id, service: { businessId } },
      include: {
        paymentMethod: { select: { name: true } },
        service: { include: { client: { select: { name: true } } } },
      },
    });
    return r ? toRow(r) : null;
  }

  async markReceived(
    id: number,
    businessId: number,
    actualAmount: number,
    actualReceiptAt: Date,
  ): Promise<ServicePaymentRow> {
    // Guard cross-tenant edits via a first lookup so `update` can use the
    // primary key (safer than `updateMany + re-fetch`).
    const existing = await prisma.service_payment.findFirst({
      where: { id, service: { businessId } },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Recebimento');

    await prisma.service_payment.update({
      where: { id: existing.id },
      data: { actualAmount, actualReceiptAt },
    });

    const fresh = await this.findOne(id, businessId);
    return fresh!;
  }

  async clearReceived(id: number, businessId: number): Promise<ServicePaymentRow> {
    const existing = await prisma.service_payment.findFirst({
      where: { id, service: { businessId } },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Recebimento');

    await prisma.service_payment.update({
      where: { id: existing.id },
      data: { actualAmount: null, actualReceiptAt: null },
    });

    const fresh = await this.findOne(id, businessId);
    return fresh!;
  }

  async cashFlowProjection(
    businessId: number,
    referenceDate: Date,
    bucketsDays: number[],
  ): Promise<CashFlowSummary> {
    // Bring every open row within the biggest bucket, plus already-received
    // rows in this month — enough to compute everything client-side once.
    const maxDays = Math.max(...bucketsDays);
    const maxDate = addDays(referenceDate, maxDays);
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);

    const openInWindow = await prisma.service_payment.findMany({
      where: {
        service: { businessId, deletedAt: null },
        actualReceiptAt: null,
        expectedReceiptAt: { lte: maxDate },
      },
      select: {
        expectedReceiptAt: true,
        netAmount: true,
      },
    });

    const buckets: CashFlowBucket[] = bucketsDays
      .slice()
      .sort((a, b) => a - b)
      .map((days) => {
        const endDate = addDays(referenceDate, days);
        let expectedNet = 0;
        let count = 0;
        for (const row of openInWindow) {
          if (row.expectedReceiptAt.getTime() <= endDate.getTime()) {
            expectedNet += Number(row.netAmount);
            count += 1;
          }
        }
        return { key: `${days}d`, endDate, expectedNet: round2(expectedNet), count };
      });

    // Received this month (based on actualReceiptAt).
    const receivedRows = await prisma.service_payment.findMany({
      where: {
        service: { businessId, deletedAt: null },
        actualReceiptAt: { gte: monthStart, lte: monthEnd },
      },
      select: { actualAmount: true, netAmount: true },
    });
    const receivedThisMonth = round2(
      receivedRows.reduce((acc, r) => acc + Number(r.actualAmount ?? r.netAmount), 0),
    );

    // Still expected to land inside this month.
    const remainingThisMonthRows = await prisma.service_payment.findMany({
      where: {
        service: { businessId, deletedAt: null },
        actualReceiptAt: null,
        expectedReceiptAt: { gte: referenceDate, lte: monthEnd },
      },
      select: { netAmount: true },
    });
    const expectedThisMonthRemaining = round2(
      remainingThisMonthRows.reduce((acc, r) => acc + Number(r.netAmount), 0),
    );

    // Overdue: expected in the past but no actual receipt yet.
    const overdueRows = await prisma.service_payment.findMany({
      where: {
        service: { businessId, deletedAt: null },
        actualReceiptAt: null,
        expectedReceiptAt: { lt: referenceDate },
      },
      select: { netAmount: true },
    });
    const overdue = {
      total: round2(overdueRows.reduce((acc, r) => acc + Number(r.netAmount), 0)),
      count: overdueRows.length,
    };

    return { now: referenceDate, buckets, receivedThisMonth, expectedThisMonthRemaining, overdue };
  }

  async listDivergences(businessId: number): Promise<ServicePaymentRow[]> {
    // Two flavours of divergence:
    //   1. Marked received but actualAmount != netAmount
    //   2. Overdue (expected in the past, still open)
    const rows = await prisma.service_payment.findMany({
      where: {
        service: { businessId, deletedAt: null },
        OR: [
          { AND: [{ actualReceiptAt: { not: null } }] }, // filtered again in code below
          { AND: [{ actualReceiptAt: null }, { expectedReceiptAt: { lt: new Date() } }] },
        ],
      },
      include: {
        paymentMethod: { select: { name: true } },
        service: { include: { client: { select: { name: true } } } },
      },
      orderBy: { expectedReceiptAt: 'desc' },
    });

    // Post-filter case 1: only keep rows whose actualAmount really diverges.
    return rows
      .filter((r) => {
        if (r.actualReceiptAt && r.actualAmount != null) {
          return Math.abs(Number(r.actualAmount) - Number(r.netAmount)) > 0.01;
        }
        return true; // overdue
      })
      .map(toRow);
  }

  async list(
    businessId: number,
    opts: {
      from?: Date;
      to?: Date;
      status?: 'pending' | 'received' | 'overdue' | 'all';
    },
  ): Promise<ServicePaymentRow[]> {
    const where: any = { service: { businessId, deletedAt: null } };

    if (opts.from || opts.to) {
      where.expectedReceiptAt = {};
      if (opts.from) where.expectedReceiptAt.gte = opts.from;
      if (opts.to) where.expectedReceiptAt.lte = opts.to;
    }

    if (opts.status === 'received') {
      where.actualReceiptAt = { not: null };
    } else if (opts.status === 'pending') {
      where.actualReceiptAt = null;
      where.expectedReceiptAt = { ...where.expectedReceiptAt, gte: new Date() };
    } else if (opts.status === 'overdue') {
      where.actualReceiptAt = null;
      where.expectedReceiptAt = { ...where.expectedReceiptAt, lt: new Date() };
    }

    const rows = await prisma.service_payment.findMany({
      where,
      include: {
        paymentMethod: { select: { name: true } },
        service: { include: { client: { select: { name: true } } } },
      },
      orderBy: { expectedReceiptAt: 'asc' },
    });
    return rows.map(toRow);
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
