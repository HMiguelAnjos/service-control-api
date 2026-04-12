import { IProductRepository } from '../../ports/iproduct-repository';

export class DeleteProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(id: number, userId: number) {
    await this.repo.delete(id, userId);
  }
}
