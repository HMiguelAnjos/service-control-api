
import { Inventory } from '../../../domain/entities/inventory';
import { IInventoryRepository } from '../../ports/iinventory-repository';

export class CreateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { productId: number; quantity: number }) {
    const entity = new Inventory(undefined, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid inventory data');
    }
    await this.repo.create(entity);
  }
}
