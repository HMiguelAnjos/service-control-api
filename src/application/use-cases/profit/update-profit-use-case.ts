import { IProfitRepository } from '../../domain/repositories/iprofit-repository';
import { Profit } from '../../../domain/entities/profit';

export class UpdateProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(input: { id: string; serviceId: string; totalProfit: number; marginPct: number }) {
    const entity = new Profit(input.id, input.serviceId, input.totalProfit, input.marginPct);
    if (!entity.isValid()) {
      throw new Error('Invalid profit data');
    }
    await this.repo.update(entity);
  }
}
