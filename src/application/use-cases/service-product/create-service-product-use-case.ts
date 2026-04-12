import { ServiceProduct } from '../../../domain/entities/service-product';
import { IServiceProductRepository } from '../../ports/iservice-product-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { userId: number; serviceId: number; productId: number; quantity: number }) {
    const entity = new ServiceProduct(undefined, input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados inválidos');
    }
    await this.repo.create(entity);
  }
}
