import { IProductRepository } from '../../domain/repositories/iproduct-repository';

export class DeleteProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
