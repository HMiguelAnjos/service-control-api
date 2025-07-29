import { IServiceProductRepository } from '../../domain/repositories/iserviceproduct-repository';
import { ServiceProduct } from '../../../domain/entities/serviceproduct';

export class UpdateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { id: string; serviceId: string; productId: string; quantity: number }) {
    const entity = new ServiceProduct(input.id, input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid serviceproduct data');
    }
    await this.repo.update(entity);
  }
}
