import { Expense } from '../../domain/entities/expense';
import { IExpenseRepository } from '../../application/ports/iexpense-repository';
import prisma from './prisma';

export class PrismaExpenseRepository implements IExpenseRepository {
  async create(expense: Expense): Promise<void> {
    await prisma.expense.create({
      data: {
        serviceId: expense.serviceId,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes,
      },
    });
  }

  async findAll(userId: number): Promise<Expense[]> {
    const rawExpenses = await prisma.expense.findMany({
      where: { deletedAt: null, service: { userId, deletedAt: null } },
    });
    return rawExpenses.map(
      (e) => new Expense(e.id, e.serviceId, e.category, e.amount.toNumber(), e.notes ?? undefined),
    );
  }

  async findOne(id: number, userId: number): Promise<Expense | null> {
    const raw = await prisma.expense.findFirst({
      where: { id, deletedAt: null, service: { userId } },
    });
    if (!raw) return null;
    return new Expense(raw.id, raw.serviceId, raw.category, raw.amount.toNumber(), raw.notes ?? undefined);
  }

  async update(expense: Expense, userId: number): Promise<void> {
    await prisma.expense.updateMany({
      where: { id: expense.id, deletedAt: null, service: { userId } },
      data: {
        serviceId: expense.serviceId,
        category: expense.category,
        amount: expense.amount,
        notes: expense.notes,
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.expense.updateMany({
      where: { id, deletedAt: null, service: { userId } },
      data: { deletedAt: new Date() },
    });
  }

  async sumByServiceId(serviceId: number): Promise<number> {
    const agg = await prisma.expense.aggregate({
      where: { serviceId, deletedAt: null },
      _sum: { amount: true },
    });
    return agg._sum.amount?.toNumber() ?? 0;
  }

  async deleteByServiceId(serviceId: number): Promise<void> {
    await prisma.expense.updateMany({
      where: { serviceId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
