import { IExpenseRepository } from '../../ports/iexpense-repository';
import { IServiceRepository } from '../../ports/iservice-repository';
import { IProfitRepository } from '../../ports/iprofit-repository';

export class DeleteExpenseUseCase {
  constructor(
    private repo: IExpenseRepository,
    private serviceRepo: IServiceRepository,
    private profitRepo: IProfitRepository,
  ) {}

  async execute(id: number, userId: number) {
    const expense = await this.repo.findOne(id, userId);
    await this.repo.delete(id, userId);
    if (expense) {
      const service = await this.serviceRepo.findOne(expense.serviceId, userId);
      if (service) {
        const totalExpenses = await this.repo.sumByServiceId(expense.serviceId);
        const totalProfit = service.price - totalExpenses;
        const marginPct = service.price > 0 ? (totalProfit / service.price) * 100 : 0;
        await this.profitRepo.upsertForService(expense.serviceId, totalProfit, marginPct);
      }
    }
  }
}
