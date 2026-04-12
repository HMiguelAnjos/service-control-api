import { ServiceProduct } from '../../domain/entities/service-product';

export interface IServiceProductRepository {
  create(serviceProduct: ServiceProduct): Promise<void>;
  findAll(userId: number): Promise<ServiceProduct[]>;
  findOne(id: number, userId: number): Promise<ServiceProduct | null>;
  update(serviceProduct: ServiceProduct, userId: number): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
  deleteByServiceId(serviceId: number): Promise<void>;
}
