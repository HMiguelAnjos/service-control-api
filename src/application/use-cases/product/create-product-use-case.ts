import { Product } from '../../../domain/entities/product';
import { randomUUID } from 'crypto';
import { IProductRepository } from '../../../domain/repositories/iproduct-repository';

export class CreateProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(input: { name: string; unitCost: number; description?: string }) {
    const entity = new Product(undefined, input.name, input.unitCost, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid product data');
    }
    await this.repo.create(entity);
  }
}
