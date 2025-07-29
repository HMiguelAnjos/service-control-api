import { InventoryDTO } from '../../../../dtos/inventory-dto';
import { IInventoryRepository } from '../../../domain/repositories/iinventory-repository';

export class ListInventorysUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(): Promise<InventoryDTO[]> {
    return this.repo.findAll();
  }
}
