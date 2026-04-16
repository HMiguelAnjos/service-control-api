import { IProductRepository } from '../../ports/iproduct-repository';
import { Product } from '../../../domain/entities/product';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateProductUseCase {
  constructor(private repo: IProductRepository) {}

  async execute(input: {
    id: number;
    userId: number;
    name: string;
    unitCost: number;
    description?: string;
  }) {
    const entity = new Product(input.id, input.userId, input.name, input.unitCost, input.description);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do produto inválidos');
    }
    await this.repo.update(entity);
  }
}
