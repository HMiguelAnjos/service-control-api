import { Profit } from '../../domain/entities/profit';

export interface IProfitRepository {
  create(profit: Profit): Promise<void>;
  findAll(userId: number): Promise<Profit[]>;
  findOne(id: number, userId: number): Promise<Profit | null>;
  update(profit: Profit, userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
  upsertForService(serviceId: number, totalProfit: number, marginPct: number): Promise<void>;
  deleteByServiceId(serviceId: number): Promise<void>;
}
