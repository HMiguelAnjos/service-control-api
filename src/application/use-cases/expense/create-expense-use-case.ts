import { IExpenseRepository } from '../../ports/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateExpenseUseCase {
  constructor(
    private repo: IExpenseRepository,
  ) {}

  async execute(input: {
    userId: number;
    serviceId?: number | null;
    category: string;
    amount: number;
    notes?: string;
  }) {
    const entity = new Expense(
      undefined,
      input.userId,
      input.category,
      input.amount,
      input.serviceId ?? null,
      input.notes,
    );
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do gasto inválidos');
    }
    await this.repo.create(entity);
  }
}
