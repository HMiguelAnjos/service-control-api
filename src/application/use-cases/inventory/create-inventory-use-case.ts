import { Inventory } from '../../../domain/entities/inventory';
import { IInventoryRepository } from '../../ports/iinventory-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { userId: number; productId: number; quantity: number }) {
    const entity = new Inventory(undefined, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do estoque inválidos');
    }
    await this.repo.create(entity);
  }
}
