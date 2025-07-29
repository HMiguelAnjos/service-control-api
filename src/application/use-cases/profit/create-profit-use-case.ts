import { IProfitRepository } from '../../domain/repositories/iprofit-repository';
import { Profit } from '../../../domain/entities/profit';
import { randomUUID } from 'crypto';

export class CreateProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(input: { serviceId: string; totalProfit: number; marginPct: number }) {
    const entity = new Profit(randomUUID(), input.serviceId, input.totalProfit, input.marginPct);
    if (!entity.isValid()) {
      throw new Error('Invalid profit data');
    }
    await this.repo.create(entity);
  }
}
