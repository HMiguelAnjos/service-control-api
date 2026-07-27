import { Business } from '../../../domain/entities/business';
import { IBusinessRepository } from '../../ports/ibusiness-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class GetBusinessUseCase {
  constructor(private repo: IBusinessRepository) {}

  async execute(businessId: number): Promise<Business> {
    const business = await this.repo.findById(businessId);
    if (!business) throw new NotFoundError('Estabelecimento');
    return business;
  }
}
