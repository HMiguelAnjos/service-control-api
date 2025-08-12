import { IServiceProductRepository } from '../../ports/iservice-product-repository';
import { ServiceProductDTO } from '../../dto/service-product-dto';

export class ListServiceProductsUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(): Promise<ServiceProductDTO[]> {
    return this.repo.findAll();
  }
}
