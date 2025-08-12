
import { IInventoryRepository } from '../../ports/iinventory-repository';
import { InventoryDTO } from '../../dto/inventory-dto';

export class ListInventorysUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(): Promise<InventoryDTO[]> {
    return this.repo.findAll();
  }
}
