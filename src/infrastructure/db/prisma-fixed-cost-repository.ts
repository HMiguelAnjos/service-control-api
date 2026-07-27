import { FixedCost } from '../../domain/entities/fixed-cost';
import { IFixedCostRepository } from '../../application/ports/ifixed-cost-repository';
import prisma from './prisma';

function toEntity(r: any): FixedCost {
  return new FixedCost({
    id: r.id,
    businessId: r.businessId,
    name: r.name,
    monthlyAmount: Number(r.monthlyAmount),
    startDate: r.startDate,
    endDate: r.endDate,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export class PrismaFixedCostRepository implements IFixedCostRepository {
  async create(cost: FixedCost): Promise<FixedCost> {
    const created = await prisma.fixed_cost.create({
      data: {
        businessId: cost.businessId,
        name: cost.name,
        monthlyAmount: cost.monthlyAmount,
        startDate: cost.startDate,
        endDate: cost.endDate ?? undefined,
        isActive: cost.isActive,
      },
    });
    return toEntity(created);
  }

  async update(
    id: number,
    businessId: number,
    patch: Partial<{
      name: string;
      monthlyAmount: number;
      startDate: Date;
      endDate: Date | null;
      isActive: boolean;
    }>,
  ): Promise<FixedCost> {
    const updated = await prisma.fixed_cost.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.monthlyAmount !== undefined ? { monthlyAmount: patch.monthlyAmount } : {}),
        ...(patch.startDate !== undefined ? { startDate: patch.startDate } : {}),
        ...(patch.endDate !== undefined ? { endDate: patch.endDate } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      },
    });
    if (updated.businessId !== businessId) {
      throw new Error('Cross-tenant update denied');
    }
    return toEntity(updated);
  }

  async findOne(id: number, businessId: number): Promise<FixedCost | null> {
    const r = await prisma.fixed_cost.findFirst({ where: { id, businessId } });
    return r ? toEntity(r) : null;
  }

  async listByBusiness(businessId: number, includeInactive = false): Promise<FixedCost[]> {
    const where: any = { businessId };
    if (!includeInactive) where.isActive = true;
    const rows = await prisma.fixed_cost.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
    return rows.map(toEntity);
  }

  async softDelete(id: number, businessId: number): Promise<void> {
    // Fixed costs are typically deactivated (isActive=false), not deleted,
    // so past-month reports remain correct.  This method just ends the
    // record's window at now().
    await prisma.fixed_cost.updateMany({
      where: { id, businessId },
      data: { isActive: false, endDate: new Date() },
    });
  }

  async totalMonthlyForBusiness(businessId: number, month: Date): Promise<number> {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // A cost "covers" this month if:
    //   startDate <= monthEnd  AND  (endDate IS NULL OR endDate >= monthStart)
    const rows = await prisma.fixed_cost.findMany({
      where: {
        businessId,
        isActive: true,
        startDate: { lte: monthEnd },
        OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
      },
      select: { monthlyAmount: true },
    });
    return rows.reduce((acc, r) => acc + Number(r.monthlyAmount), 0);
  }
}
