import { IServiceProductRepository } from '../../ports/iservice-product-repository';
import { ServiceProduct } from '../../../domain/entities/service-product';

export class ListServiceProductsUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(userId: number): Promise<ServiceProduct[]> {
    return this.repo.findAll(userId);
  }
}
