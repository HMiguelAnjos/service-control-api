import { IFixedCostRepository } from '../../ports/ifixed-cost-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class DeleteFixedCostUseCase {
  constructor(private repo: IFixedCostRepository) {}

  async execute(id: number, businessId: number): Promise<void> {
    const existing = await this.repo.findOne(id, businessId);
    if (!existing) throw new NotFoundError('Custo fixo');
    await this.repo.softDelete(id, businessId);
  }
}
