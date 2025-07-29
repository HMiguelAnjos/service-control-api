import { IInventoryRepository } from '../../domain/repositories/iinventory-repository';
import { Inventory } from '../../../domain/entities/inventory';

export class UpdateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { id: string; productId: string; quantity: number }) {
    const entity = new Inventory(input.id, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid inventory data');
    }
    await this.repo.update(entity);
  }
}
