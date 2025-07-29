import { ProductDTO } from '../../../../dtos/product-dto';
import { IProductRepository } from '../../../domain/repositories/iproduct-repository';

export class ListProductsUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(): Promise<ProductDTO[]> {
    return this.repo.findAll();
  }
}
