import { IProductRepository } from '../../ports/iproduct-repository';
import { Product } from '../../../domain/entities/product';

export class ListProductsUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(userId: number): Promise<Product[]> {
    return this.repo.findAll(userId);
  }
}
