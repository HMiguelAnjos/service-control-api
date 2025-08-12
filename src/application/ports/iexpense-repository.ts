import { Expense } from "../../domain/entities/expense";

export interface IExpenseRepository {
  create(expense: Expense): Promise<void>;
  findAll(): Promise<Expense[]>;
  update(expense: Expense): Promise<void>;
  delete(id: number): Promise<void>;
}
