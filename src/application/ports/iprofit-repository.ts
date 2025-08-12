import { Profit } from "../../domain/entities/profit";

export interface IProfitRepository {
  create(profit: Profit): Promise<void>;
  findAll(): Promise<Profit[]>;
  update(profit: Profit): Promise<void>;
  delete(id: number): Promise<void>;
}
