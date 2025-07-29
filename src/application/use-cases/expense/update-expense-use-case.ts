import { IExpenseRepository } from '../../../domain/repositories/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';

export class UpdateExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(input: {
    id: string;
    serviceId: string;
    category: string;
    amount: number;
    notes?: string;
  }) {
    const entity = new Expense(
      input.id,
      input.serviceId,
      input.category,
      input.amount,
      input.notes
    );

    if (!entity.isValid()) {
      throw new Error('Invalid expense data');
    }

    await this.repo.update(entity);
  }
}
