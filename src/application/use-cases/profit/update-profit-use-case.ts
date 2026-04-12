import { IProfitRepository } from '../../ports/iprofit-repository';
import { Profit } from '../../../domain/entities/profit';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(input: { id: number; userId: number; serviceId: number; totalProfit: number; marginPct: number }) {
    const entity = new Profit(input.id, input.serviceId, input.totalProfit, input.marginPct);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do lucro inválidos');
    }
    await this.repo.update(entity, input.userId);
  }
}
