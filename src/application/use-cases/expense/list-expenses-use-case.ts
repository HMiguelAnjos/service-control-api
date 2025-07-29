import { IExpenseRepository } from '../../../domain/repositories/iexpense-repository';
import { ExpenseDTO } from '../../../domain/types/expense-dto';

export class ListExpensesUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(): Promise<ExpenseDTO[]> {
    return await this.repo.findAll();
  }
}
