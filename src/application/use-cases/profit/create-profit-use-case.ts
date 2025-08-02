import { Profit } from '../../../domain/entities/profit';
import { IProfitRepository } from '../../../domain/repositories/iprofit-repository';

export class CreateProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(input: { serviceId: number; totalProfit: number; marginPct: number }) {
    const entity = new Profit(undefined, input.serviceId, input.totalProfit, input.marginPct);
    if (!entity.isValid()) {
      throw new Error('Invalid profit data');
    }
    await this.repo.create(entity);
  }
}
