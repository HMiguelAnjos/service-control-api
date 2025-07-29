import { IInventoryRepository } from '../../domain/repositories/iinventory-repository';
import { Inventory } from '../../../domain/entities/inventory';
import { randomUUID } from 'crypto';

export class CreateInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(input: { productId: string; quantity: number }) {
    const entity = new Inventory(randomUUID(), input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid inventory data');
    }
    await this.repo.create(entity);
  }
}
