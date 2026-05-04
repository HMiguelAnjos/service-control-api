import { IExpenseRepository } from '../../ports/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';
import { Page, PaginationParams } from '../../utils/pagination';

export class ListExpensesUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(userId: number): Promise<Expense[]> {
    return this.repo.findAll(userId);
  }

  async executePaginated(userId: number, params: PaginationParams): Promise<Page<Expense>> {
    return this.repo.findPage(userId, params);
  }
}
