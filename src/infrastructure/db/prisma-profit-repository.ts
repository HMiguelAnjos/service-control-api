import { PrismaClient } from '@prisma/client';
import { Profit } from '../../domain/entities/profit';
import { IProfitRepository } from '../../application/ports/iprofit-repository';

const prisma = new PrismaClient();

export class PrismaProfitRepository implements IProfitRepository {
  async create(profit: Profit): Promise<void> {
    await prisma.profit.create({
      data: {
        serviceId: profit.serviceId,
        totalProfit: profit.totalProfit,
        marginPct: profit.marginPct,
      },
    });
  }

  async findAll(): Promise<Profit[]> {
    const rawProfits = await prisma.profit.findMany({
      where: { deletedAt: null },
    });
    return rawProfits.map(
      (p: any) =>
        new Profit(
          p.id,
          p.serviceId,
          p.totalProfit.toNumber(),
          p.marginPct.toNumber(),
        )
    );
  }

  async update(profit: Profit): Promise<void> {
    await prisma.profit.update({
      where: { id: profit.id },
      data: {
        serviceId: profit.serviceId,
        totalProfit: profit.totalProfit,
        marginPct: profit.marginPct,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.profit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Profit | null> {
    const raw = await prisma.profit.findUnique({
      where: { id, deletedAt: null },
    });

    if (!raw) return null;

    return new Profit(
      raw.id,
      raw.serviceId,
      raw.totalProfit.toNumber(),
      raw.marginPct.toNumber(),
    );
  }
}
