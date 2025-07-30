import { ServiceProduct } from "../entities/service-product";

export interface IServiceProductRepository {
  create(serviceproduct: ServiceProduct): Promise<void>;
  findAll(): Promise<ServiceProduct[]>;
  update(serviceproduct: ServiceProduct): Promise<void>;
  delete(id: number): Promise<void>;
}
