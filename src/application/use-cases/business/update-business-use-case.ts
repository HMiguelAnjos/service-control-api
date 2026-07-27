import { Business } from '../../../domain/entities/business';
import { IBusinessRepository, UpdateBusinessInput } from '../../ports/ibusiness-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export class UpdateBusinessUseCase {
  constructor(private repo: IBusinessRepository) {}

  async execute(businessId: number, patch: UpdateBusinessInput): Promise<Business> {
    const existing = await this.repo.findById(businessId);
    if (!existing) throw new NotFoundError('Estabelecimento');

    if (patch.name !== undefined && patch.name.trim().length === 0) {
      throw new ValidationError('Nome não pode ficar vazio.');
    }
    if (
      patch.monthlyServiceEstimate !== undefined &&
      patch.monthlyServiceEstimate !== null &&
      patch.monthlyServiceEstimate <= 0
    ) {
      throw new ValidationError('Estimativa de atendimentos precisa ser > 0.');
    }

    return this.repo.update(businessId, patch);
  }
}
