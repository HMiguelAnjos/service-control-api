import { randomUUID } from 'crypto';
import { ServiceProduct } from '../../../domain/entities/service-product';
import { IServiceProductRepository } from '../../../domain/repositories/iservice-product-repository';

export class CreateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { serviceId: number; productId: number; quantity: number }) {
    const entity = new ServiceProduct(undefined, input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid serviceproduct data');
    }
    await this.repo.create(entity);
  }
}
