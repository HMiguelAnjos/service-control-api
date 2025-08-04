import { PrismaClient } from '@prisma/client';
import { Expense } from '../../domain/entities/expense';
import { IExpenseRepository } from '../../domain/repositories/iexpense-repository';

const prisma = new PrismaClient();

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

  async findAll(): Promise<Expense[]> {
    const rawExpenses = await prisma.expense.findMany({
      where: { deletedAt: null },
    });
    return rawExpenses.map(
      (e: any) =>
        new Expense(
          e.id,
          e.serviceId,
          e.category,
          e.amount.toNumber(),
          e.notes ?? undefined,
        )
    );
  }

  async update(expense: Expense): Promise<void> {
  await prisma.expense.update({
    where: { id: expense.id },
    data: {
      serviceId: expense.serviceId,
      category: expense.category,
      amount: expense.amount,
      notes: expense.notes,
    },
  });
}

  async delete(id: number): Promise<void> {
    await prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Expense | null> {
    const raw = await prisma.expense.findUnique({
      where: { id, deletedAt: null },
    });

    if (!raw) return null;

    return new Expense(
      raw.id,
      raw.serviceId,
      raw.category,
      raw.amount.toNumber(),
      raw.notes ?? undefined,
    );
  }
}
