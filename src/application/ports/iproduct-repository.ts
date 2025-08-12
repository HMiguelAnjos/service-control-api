import { Product } from "../../domain/entities/product";

export interface IProductRepository {
  create(product: Product): Promise<void>;
  findAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
  delete(id: number): Promise<void>;
}
