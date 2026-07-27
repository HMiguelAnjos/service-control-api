import { Professional } from '../../../domain/entities/professional';
import { IProfessionalRepository } from '../../ports/iprofessional-repository';

export class ListProfessionalsUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(businessId: number, includeInactive = false): Promise<Professional[]> {
    return this.repo.listByBusiness(businessId, includeInactive);
  }
}
