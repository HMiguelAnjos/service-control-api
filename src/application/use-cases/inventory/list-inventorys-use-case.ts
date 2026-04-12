import { IInventoryRepository } from '../../ports/iinventory-repository';
import { Inventory } from '../../../domain/entities/inventory';

export class ListInventorysUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(userId: number): Promise<Inventory[]> {
    return this.repo.findAll(userId);
  }
}
