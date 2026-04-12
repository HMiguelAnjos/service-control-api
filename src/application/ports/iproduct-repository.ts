import { Product } from '../../domain/entities/product';

export interface IProductRepository {
  create(product: Product): Promise<void>;
  findAll(userId: number): Promise<Product[]>;
  findOne(id: number, userId: number): Promise<Product | null>;
  update(product: Product): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
