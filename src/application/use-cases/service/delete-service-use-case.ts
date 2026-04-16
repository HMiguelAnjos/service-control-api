import { IServiceRepository } from '../../ports/iservice-repository';
import { IExpenseRepository } from '../../ports/iexpense-repository';

export class DeleteServiceUseCase {
  constructor(
    private repo: IServiceRepository,
    private expenseRepo: IExpenseRepository,
  ) {}

  async execute(id: number, userId: number) {
    await this.expenseRepo.deleteByServiceId(id);
    await this.repo.delete(id, userId);
  }
}
