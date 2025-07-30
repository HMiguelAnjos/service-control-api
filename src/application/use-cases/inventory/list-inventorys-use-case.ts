
import { IInventoryRepository } from '../../../domain/repositories/iinventory-repository';
import { InventoryDTO } from '../../../domain/types/inventory-dto';

export class ListInventorysUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(): Promise<InventoryDTO[]> {
    return this.repo.findAll();
  }
}
