import { Inventory } from "../../domain/entities/inventory";

export interface IInventoryRepository {
  create(inventory: Inventory): Promise<void>;
  findAll(): Promise<Inventory[]>;
  update(inventory: Inventory): Promise<void>;
  delete(id: string): Promise<void>;
}
