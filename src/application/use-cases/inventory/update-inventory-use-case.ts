import { IInventoryRepository } from '../../ports/iinventory-repository';
import { Inventory } from '../../../domain/entities/inventory';

export class UpdateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { id: number; productId: number; quantity: number }) {
    const entity = new Inventory(input.id, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid inventory data');
    }
    await this.repo.update(entity);
  }
}
