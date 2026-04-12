import { Profit } from '../../domain/entities/profit';
import { IProfitRepository } from '../../application/ports/iprofit-repository';
import prisma from './prisma';

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

  async findAll(userId: number): Promise<Profit[]> {
    const rawProfits = await prisma.profit.findMany({
      where: { deletedAt: null, service: { userId, deletedAt: null } },
    });
    return rawProfits.map(
      (p) => new Profit(p.id, p.serviceId, p.totalProfit.toNumber(), p.marginPct.toNumber()),
    );
  }

  async findOne(id: number, userId: number): Promise<Profit | null> {
    const raw = await prisma.profit.findFirst({
      where: { id, deletedAt: null, service: { userId } },
    });
    if (!raw) return null;
    return new Profit(raw.id, raw.serviceId, raw.totalProfit.toNumber(), raw.marginPct.toNumber());
  }

  async update(profit: Profit, userId: number): Promise<void> {
    await prisma.profit.updateMany({
      where: { id: profit.id, deletedAt: null, service: { userId } },
      data: {
        serviceId: profit.serviceId,
        totalProfit: profit.totalProfit,
        marginPct: profit.marginPct,
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.profit.updateMany({
      where: { id, deletedAt: null, service: { userId } },
      data: { deletedAt: new Date() },
    });
  }

  async upsertForService(serviceId: number, totalProfit: number, marginPct: number): Promise<void> {
    const existing = await prisma.profit.findFirst({ where: { serviceId, deletedAt: null } });
    if (existing) {
      await prisma.profit.update({ where: { id: existing.id }, data: { totalProfit, marginPct } });
    } else {
      await prisma.profit.create({ data: { serviceId, totalProfit, marginPct } });
    }
  }

  async deleteByServiceId(serviceId: number): Promise<void> {
    await prisma.profit.updateMany({
      where: { serviceId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
