import { IProductRepository } from '../../ports/iproduct-repository';
import { Product } from '../../../domain/entities/product';

export class UpdateProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(input: { id: number; name: string; unitCost: number; description?: string }) {
    const entity = new Product(input.id, input.name, input.unitCost, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid product data');
    }
    await this.repo.update(entity);
  }
}
