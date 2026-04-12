import { IExpenseRepository } from '../../ports/iexpense-repository';
import { IServiceRepository } from '../../ports/iservice-repository';
import { IProfitRepository } from '../../ports/iprofit-repository';
import { Expense } from '../../../domain/entities/expense';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateExpenseUseCase {
  constructor(
    private repo: IExpenseRepository,
    private serviceRepo: IServiceRepository,
    private profitRepo: IProfitRepository,
  ) {}

  async execute(input: { userId: number; serviceId: number; category: string; amount: number; notes?: string }) {
    const entity = new Expense(undefined, input.serviceId, input.category, input.amount, input.notes);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do gasto inválidos');
    }
    await this.repo.create(entity);
    const service = await this.serviceRepo.findOne(input.serviceId, input.userId);
    if (service) {
      const totalExpenses = await this.repo.sumByServiceId(input.serviceId);
      const totalProfit = service.price - totalExpenses;
      const marginPct = service.price > 0 ? (totalProfit / service.price) * 100 : 0;
      await this.profitRepo.upsertForService(input.serviceId, totalProfit, marginPct);
    }
  }
}
