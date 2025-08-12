import { IProductRepository } from '../../ports/iproduct-repository';
import { ProductDTO } from '../../dto/product-dto';

export class ListProductsUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(): Promise<ProductDTO[]> {
    return this.repo.findAll();
  }
}
