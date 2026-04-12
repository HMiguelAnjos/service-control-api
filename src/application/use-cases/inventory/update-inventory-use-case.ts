import { IInventoryRepository } from '../../ports/iinventory-repository';
import { Inventory } from '../../../domain/entities/inventory';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { id: number; userId: number; productId: number; quantity: number }) {
    const entity = new Inventory(input.id, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do estoque inválidos');
    }
    await this.repo.update(entity, input.userId);
  }
}
