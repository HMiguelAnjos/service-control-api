import { AvailabilityRule } from '../../../domain/entities/availability-rule';
import { IAvailabilityRepository } from '../../ports/iavailability-repository';

export class GetAvailabilityRulesUseCase {
  constructor(private repo: IAvailabilityRepository) {}

  async execute(userId: number): Promise<AvailabilityRule[]> {
    return this.repo.listByUser(userId);
  }
}
