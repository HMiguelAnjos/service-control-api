import { BlockedTime } from '../../domain/entities/blocked-time';
import { IBlockedTimeRepository } from '../../application/ports/iblocked-time-repository';
import prisma from './prisma';

function toEntity(r: any): BlockedTime {
  return new BlockedTime({
    id: r.id,
    userId: r.userId,
    startTime: r.startTime,
    endTime: r.endTime,
    reason: r.reason,
    createdAt: r.createdAt,
  });
}

export class PrismaBlockedTimeRepository implements IBlockedTimeRepository {
  async create(b: BlockedTime): Promise<BlockedTime> {
    const created = await prisma.blocked_time.create({
      data: {
        userId: b.userId,
        startTime: b.startTime,
        endTime: b.endTime,
        reason: b.reason ?? undefined,
      },
    });
    return toEntity(created);
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.blocked_time.deleteMany({ where: { id, userId } });
  }

  async list(userId: number, from?: Date, to?: Date): Promise<BlockedTime[]> {
    const where: any = { userId };
    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = from;
      if (to)   where.startTime.lte = to;
    }
    const rows = await prisma.blocked_time.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
    return rows.map(toEntity);
  }

  async findOverlapping(userId: number, start: Date, end: Date): Promise<BlockedTime[]> {
    const rows = await prisma.blocked_time.findMany({
      where: {
        userId,
        startTime: { lt: end },
        endTime:   { gt: start },
      },
    });
    return rows.map(toEntity);
  }
}
