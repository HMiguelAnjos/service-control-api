import { IExpenseRepository } from '../../../domain/repositories/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';

export class CreateExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(input: {
    serviceId: number;
    category: string;
    amount: number;
    notes?: string;
  }) {
    const entity = new Expense(
      undefined,
      input.serviceId,
      input.category,
      input.amount,
      input.notes
    );

    if (!entity.isValid()) {
      throw new Error('Invalid expense data');
    }

    await this.repo.create(entity);
  }
}
