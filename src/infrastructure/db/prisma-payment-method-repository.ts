import { PaymentMethod } from '../../domain/entities/payment-method';
import { IPaymentMethodRepository } from '../../application/ports/ipayment-method-repository';
import prisma from './prisma';

function toEntity(r: any): PaymentMethod {
  return new PaymentMethod({
    id: r.id,
    businessId: r.businessId,
    name: r.name,
    feePercent: Number(r.feePercent),
    receiptDays: r.receiptDays,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deletedAt: r.deletedAt,
  });
}

export class PrismaPaymentMethodRepository implements IPaymentMethodRepository {
  async create(pm: PaymentMethod): Promise<PaymentMethod> {
    const created = await prisma.payment_method.create({
      data: {
        businessId: pm.businessId,
        name: pm.name,
        feePercent: pm.feePercent,
        receiptDays: pm.receiptDays,
        isActive: pm.isActive,
      },
    });
    return toEntity(created);
  }

  async update(
    id: number,
    businessId: number,
    patch: Partial<{
      name: string;
      feePercent: number;
      receiptDays: number;
      isActive: boolean;
    }>,
  ): Promise<PaymentMethod> {
    const updated = await prisma.payment_method.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.feePercent !== undefined ? { feePercent: patch.feePercent } : {}),
        ...(patch.receiptDays !== undefined ? { receiptDays: patch.receiptDays } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      },
    });
    if (updated.businessId !== businessId) {
      throw new Error('Cross-tenant update denied');
    }
    return toEntity(updated);
  }

  async findOne(id: number, businessId: number): Promise<PaymentMethod | null> {
    const r = await prisma.payment_method.findFirst({
      where: { id, businessId, deletedAt: null },
    });
    return r ? toEntity(r) : null;
  }

  async listByBusiness(businessId: number, includeInactive = false): Promise<PaymentMethod[]> {
    const where: any = { businessId, deletedAt: null };
    if (!includeInactive) where.isActive = true;
    const rows = await prisma.payment_method.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return rows.map(toEntity);
  }

  async softDelete(id: number, businessId: number): Promise<void> {
    await prisma.payment_method.updateMany({
      where: { id, businessId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
