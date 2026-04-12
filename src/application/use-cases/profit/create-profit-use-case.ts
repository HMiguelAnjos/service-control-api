import { Profit } from '../../../domain/entities/profit';
import { IProfitRepository } from '../../ports/iprofit-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(input: { userId: number; serviceId: number; totalProfit: number; marginPct: number }) {
    const entity = new Profit(undefined, input.serviceId, input.totalProfit, input.marginPct);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do lucro inválidos');
    }
    await this.repo.create(entity);
  }
}
