import { ServiceProduct } from '../../../domain/entities/service-product';
import { IServiceProductRepository } from '../../ports/iservice-product-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { id: number; userId: number; serviceId: number; productId: number; quantity: number }) {
    const entity = new ServiceProduct(input.id, input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados inválidos');
    }
    await this.repo.update(entity, input.userId);
  }
}
