import { AvailabilityRule } from '../../domain/entities/availability-rule';
import { IAvailabilityRepository } from '../../application/ports/iavailability-repository';
import prisma from './prisma';

function toEntity(r: any): AvailabilityRule {
  return new AvailabilityRule({
    id: r.id,
    userId: r.userId,
    dayOfWeek: r.dayOfWeek,
    startMinutes: r.startMinutes,
    endMinutes: r.endMinutes,
    isActive: r.isActive,
  });
}

export class PrismaAvailabilityRepository implements IAvailabilityRepository {
  async listByUser(userId: number): Promise<AvailabilityRule[]> {
    const rows = await prisma.availability_rule.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
    });
    return rows.map(toEntity);
  }

  async replaceForUser(userId: number, rules: AvailabilityRule[]): Promise<AvailabilityRule[]> {
    return prisma.$transaction(async (tx) => {
      await tx.availability_rule.deleteMany({ where: { userId } });
      if (rules.length === 0) return [];
      await tx.availability_rule.createMany({
        data: rules.map(r => ({
          userId,
          dayOfWeek: r.dayOfWeek,
          startMinutes: r.startMinutes,
          endMinutes: r.endMinutes,
          isActive: r.isActive,
        })),
      });
      const fresh = await tx.availability_rule.findMany({
        where: { userId },
        orderBy: [{ dayOfWeek: 'asc' }, { startMinutes: 'asc' }],
      });
      return fresh.map(toEntity);
    });
  }
}
