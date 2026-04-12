import { Inventory } from '../../domain/entities/inventory';

export interface IInventoryRepository {
  create(inventory: Inventory): Promise<void>;
  findAll(userId: number): Promise<Inventory[]>;
  findOne(id: number, userId: number): Promise<Inventory | null>;
  update(inventory: Inventory, userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
