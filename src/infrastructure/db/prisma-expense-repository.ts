import { Expense } from '../../domain/entities/expense';
import { IExpenseRepository } from '../../application/ports/iexpense-repository';
import { Page, PaginationParams, buildPage } from '../../application/utils/pagination';
import prisma from './prisma';

function toEntity(e: any): Expense {
  return new Expense(e.id, e.userId, e.category, Number(e.amount), e.serviceId ?? undefined, e.notes ?? undefined);
}

export class PrismaExpenseRepository implements IExpenseRepository {
  async create(expense: Expense): Promise<void> {
    await prisma.expense.create({
      data: {
        userId: expense.userId,
        serviceId: expense.serviceId ?? null,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes,
      },
    });
  }

  async findAll(userId: number): Promise<Expense[]> {
    const rows = await prisma.expense.findMany({
      where: { userId, deletedAt: null },
      orderBy: { id: 'desc' },
    });
    return rows.map(toEntity);
  }

  async findPage(userId: number, params: PaginationParams): Promise<Page<Expense>> {
    const rows = await prisma.expense.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: params.limit + 1,
    });
    return buildPage(rows, params.limit, (r) => r.id, toEntity);
  }

  async findOne(id: number, userId: number): Promise<Expense | null> {
    const raw = await prisma.expense.findFirst({ where: { id, userId, deletedAt: null } });
    return raw ? toEntity(raw) : null;
  }

  async update(expense: Expense, userId: number): Promise<void> {
    await prisma.expense.updateMany({
      where: { id: expense.id, userId, deletedAt: null },
      data: { serviceId: expense.serviceId ?? null, category: expense.category, amount: expense.amount, notes: expense.notes },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.expense.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } });
  }

  async sumByServiceId(serviceId: number): Promise<number> {
    const agg = await prisma.expense.aggregate({ where: { serviceId, deletedAt: null }, _sum: { amount: true } });
    return agg._sum.amount?.toNumber() ?? 0;
  }

  async deleteByServiceId(serviceId: number): Promise<void> {
    await prisma.expense.updateMany({ where: { serviceId, deletedAt: null }, data: { deletedAt: new Date() } });
  }
}
