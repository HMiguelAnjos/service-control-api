import { IServiceRepository } from '../../ports/iservice-repository';
import { IExpenseRepository } from '../../ports/iexpense-repository';
import { IProfitRepository } from '../../ports/iprofit-repository';
import { Service } from '../../../domain/entities/service';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateServiceUseCase {
  constructor(
    private repo: IServiceRepository,
    private expenseRepo: IExpenseRepository,
    private profitRepo: IProfitRepository,
  ) {}

  async execute(input: {
    id: number;
    userId: number;
    clientId: number;
    procedureId: number;
    price: number;
    date?: Date;
    description?: string;
  }) {
    const entity = new Service(
      input.id,
      input.userId,
      input.clientId,
      input.procedureId,
      input.price,
      input.date ?? new Date(),
      input.description,
    );
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do atendimento inválidos');
    }
    await this.repo.update(entity);
    const totalExpenses = await this.expenseRepo.sumByServiceId(input.id);
    const totalProfit = input.price - totalExpenses;
    const marginPct = input.price > 0 ? (totalProfit / input.price) * 100 : 0;
    await this.profitRepo.upsertForService(input.id, totalProfit, marginPct);
  }
}
