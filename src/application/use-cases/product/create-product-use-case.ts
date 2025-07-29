import { IProductRepository } from '../../domain/repositories/iproduct-repository';
import { Product } from '../../../domain/entities/product';
import { randomUUID } from 'crypto';

export class CreateProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(input: { name: string; unitCost: number; description?: string }) {
    const entity = new Product(randomUUID(), input.name, input.unitCost, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid product data');
    }
    await this.repo.create(entity);
  }
}
