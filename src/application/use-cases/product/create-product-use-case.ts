import { Product } from '../../../domain/entities/product';
import { IProductRepository } from '../../ports/iproduct-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(input: { userId: number; name: string; unitCost: number; description?: string }) {
    const entity = new Product(undefined, input.userId, input.name, input.unitCost, input.description);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do produto inválidos');
    }
    await this.repo.create(entity);
  }
}
