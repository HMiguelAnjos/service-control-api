import { IServiceProductRepository } from '../../domain/repositories/iserviceproduct-repository';
import { ServiceProduct } from '../../../domain/entities/serviceproduct';
import { randomUUID } from 'crypto';

export class CreateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { serviceId: string; productId: string; quantity: number }) {
    const entity = new ServiceProduct(randomUUID(), input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid serviceproduct data');
    }
    await this.repo.create(entity);
  }
}
