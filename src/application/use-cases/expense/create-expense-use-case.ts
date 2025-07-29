import { IExpenseRepository } from '../../../domain/repositories/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';
import { randomUUID } from 'crypto';

export class CreateExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(input: {
    serviceId: string;
    category: string;
    amount: number;
    notes?: string;
  }) {
    const entity = new Expense(
      randomUUID(),
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
