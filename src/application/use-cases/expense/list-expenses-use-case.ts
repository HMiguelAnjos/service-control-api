import { IExpenseRepository } from '../../ports/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';

export class ListExpensesUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(userId: number): Promise<Expense[]> {
    return this.repo.findAll(userId);
  }
}
