import { FixedCost } from '../../../domain/entities/fixed-cost';
import { IFixedCostRepository } from '../../ports/ifixed-cost-repository';

export class ListFixedCostsUseCase {
  constructor(private repo: IFixedCostRepository) {}

  async execute(businessId: number, includeInactive = false): Promise<FixedCost[]> {
    return this.repo.listByBusiness(businessId, includeInactive);
  }
}
