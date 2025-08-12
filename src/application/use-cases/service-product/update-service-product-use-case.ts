import { ServiceProduct } from "../../../domain/entities/service-product";
import { IServiceProductRepository } from "../../ports/iservice-product-repository";

export class UpdateServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(input: { id: number; serviceId: number; productId: number; quantity: number }) {
    const entity = new ServiceProduct(input.id, input.serviceId, input.productId, input.quantity);
    if (!entity.isValid()) {
      throw new Error('Invalid serviceproduct data');
    }
    await this.repo.update(entity);
  }
}
