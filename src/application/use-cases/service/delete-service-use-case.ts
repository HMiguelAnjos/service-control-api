import { IServiceRepository } from '../../ports/iservice-repository';
import { IExpenseRepository } from '../../ports/iexpense-repository';
import { IServiceProductRepository } from '../../ports/iservice-product-repository';
import { IProfitRepository } from '../../ports/iprofit-repository';

export class DeleteServiceUseCase {
  constructor(
    private repo: IServiceRepository,
    private expenseRepo: IExpenseRepository,
    private serviceProductRepo: IServiceProductRepository,
    private profitRepo: IProfitRepository,
  ) {}

  async execute(id: number, userId: number) {
    await this.expenseRepo.deleteByServiceId(id);
    await this.serviceProductRepo.deleteByServiceId(id);
    await this.profitRepo.deleteByServiceId(id);
    await this.repo.delete(id, userId);
  }
}
