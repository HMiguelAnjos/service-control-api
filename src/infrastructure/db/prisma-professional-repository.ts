import { Professional } from '../../domain/entities/professional';
import { IProfessionalRepository } from '../../application/ports/iprofessional-repository';
import prisma from './prisma';

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

export class PrismaProfessionalRepository implements IProfessionalRepository {
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

  async listByBusiness(businessId: number): Promise<Professional[]> {
    const rows = await prisma.professional.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return rows.map(toEntity);
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
