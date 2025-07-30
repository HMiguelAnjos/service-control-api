import { IServiceProductRepository } from '../../../domain/repositories/iservice-product-repository';
import { ServiceProductDTO } from '../../../domain/types/service-product-dto';

export class ListServiceProductsUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(): Promise<ServiceProductDTO[]> {
    return this.repo.findAll();
  }
}
