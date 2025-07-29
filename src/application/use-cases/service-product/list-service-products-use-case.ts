import { ServiceProductDTO } from '../../../../dtos/service-product-dto';
import { IServiceProductRepository } from '../../../domain/repositories/iservice-product-repository';

export class ListServiceProductsUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(): Promise<ServiceProductDTO[]> {
    return this.repo.findAll();
  }
}
