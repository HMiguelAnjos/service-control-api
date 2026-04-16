import { IExpenseRepository } from '../../ports/iexpense-repository';
import { Expense } from '../../../domain/entities/expense';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateExpenseUseCase {
  constructor(
    private repo: IExpenseRepository,
  ) {}

  async execute(input: {
    id: number;
    userId: number;
    serviceId?: number | null;
    category: string;
    amount: number;
    notes?: string;
  }) {
    const entity = new Expense(
      input.id,
      input.userId,
      input.category,
      input.amount,
      input.serviceId ?? null,
      input.notes,
    );
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do gasto inválidos');
    }
    await this.repo.update(entity, input.userId);
  }
}
