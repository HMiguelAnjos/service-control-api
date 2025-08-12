import { IExpenseRepository } from '../../ports/iexpense-repository';
import { ExpenseDTO } from '../../dto/expense-dto';

export class ListExpensesUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(): Promise<ExpenseDTO[]> {
    return await this.repo.findAll();
  }
}
