import { IProductRepository } from '../../../domain/repositories/iproduct-repository';
import { ProductDTO } from '../../../domain/types/product-dto';

export class ListProductsUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(): Promise<ProductDTO[]> {
    return this.repo.findAll();
  }
}
