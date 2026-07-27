import { Professional } from '../../domain/entities/professional';
import {
  IProfessionalRepository,
  UpdateProfessionalInput,
  CommissionRuleRow,
} from '../../application/ports/iprofessional-repository';
import prisma from './prisma';
import { NotFoundError } from '../../middlewares/errors/errors';

function toEntity(r: any): Professional {
  return new Professional({
    id: r.id,
    businessId: r.businessId,
    userId: r.userId,
    name: r.name,
    hourlyCost: r.hourlyCost != null ? Number(r.hourlyCost) : null,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deletedAt: r.deletedAt,
  });
}
function toRule(r: any): CommissionRuleRow {
  return {
    id: r.id,
    professionalId: r.professionalId,
    percent: Number(r.percent),
    startDate: r.startDate,
    endDate: r.endDate,
    createdAt: r.createdAt,
  };
}

export class PrismaProfessionalRepository implements IProfessionalRepository {
  async create(entity: Professional): Promise<Professional> {
    const created = await prisma.professional.create({
      data: {
        businessId: entity.businessId,
        userId: entity.userId ?? undefined,
        name: entity.name,
        hourlyCost: entity.hourlyCost ?? undefined,
        isActive: entity.isActive,
      },
    });
    return toEntity(created);
  }

  async update(
    id: number,
    businessId: number,
    patch: UpdateProfessionalInput,
  ): Promise<Professional> {
    const existing = await prisma.professional.findFirst({
      where: { id, businessId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Profissional');

    const updated = await prisma.professional.update({
      where: { id: existing.id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.hourlyCost !== undefined ? { hourlyCost: patch.hourlyCost } : {}),
        ...(patch.userId !== undefined ? { userId: patch.userId } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
      },
    });
    return toEntity(updated);
  }

  async softDelete(id: number, businessId: number): Promise<void> {
    await prisma.professional.updateMany({
      where: { id, businessId, deletedAt: null },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async findOne(id: number, businessId: number): Promise<Professional | null> {
    const r = await prisma.professional.findFirst({
      where: { id, businessId, deletedAt: null },
    });
    return r ? toEntity(r) : null;
  }

  async findByUserId(userId: number): Promise<Professional | null> {
    const r = await prisma.professional.findUnique({ where: { userId } });
    return r && !r.deletedAt ? toEntity(r) : null;
  }

  async listByBusiness(businessId: number, includeInactive = false): Promise<Professional[]> {
    const where: any = { businessId, deletedAt: null };
    if (!includeInactive) where.isActive = true;
    const rows = await prisma.professional.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return rows.map(toEntity);
  }

  async setCommissionPercent(input: {
    professionalId: number;
    businessId: number;
    percent: number;
    startDate?: Date;
  }): Promise<CommissionRuleRow> {
    // Guard against cross-tenant writes.
    const prof = await prisma.professional.findFirst({
      where: { id: input.professionalId, businessId: input.businessId, deletedAt: null },
      select: { id: true },
    });
    if (!prof) throw new NotFoundError('Profissional');

    const startDate = input.startDate ?? new Date();

    return prisma.$transaction(async (tx) => {
      // Close the currently active rule (if any).
      await tx.commission_rule.updateMany({
        where: { professionalId: input.professionalId, endDate: null },
        data: { endDate: startDate },
      });

      const created = await tx.commission_rule.create({
        data: {
          professionalId: input.professionalId,
          percent: input.percent,
          startDate,
        },
      });
      return toRule(created);
    });
  }

  async listCommissionRules(
    professionalId: number,
    businessId: number,
  ): Promise<CommissionRuleRow[]> {
    const prof = await prisma.professional.findFirst({
      where: { id: professionalId, businessId, deletedAt: null },
      select: { id: true },
    });
    if (!prof) throw new NotFoundError('Profissional');

    const rows = await prisma.commission_rule.findMany({
      where: { professionalId },
      orderBy: { startDate: 'desc' },
    });
    return rows.map(toRule);
  }

  async getCommissionPercentAt(professionalId: number, date: Date): Promise<number | null> {
    const rule = await prisma.commission_rule.findFirst({
      where: {
        professionalId,
        startDate: { lte: date },
        OR: [{ endDate: null }, { endDate: { gte: date } }],
      },
      orderBy: { startDate: 'desc' },
    });
    return rule ? Number(rule.percent) : null;
  }
}
