import { IServiceProductRepository } from '../../../domain/repositories/iservice-product-repository';

export class DeleteServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
