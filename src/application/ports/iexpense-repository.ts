import { Expense } from '../../domain/entities/expense';

export interface IExpenseRepository {
  create(expense: Expense): Promise<void>;
  findAll(userId: number): Promise<Expense[]>;
  findOne(id: number, userId: number): Promise<Expense | null>;
  update(expense: Expense, userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
  sumByServiceId(serviceId: number): Promise<number>;
  deleteByServiceId(serviceId: number): Promise<void>;
}
