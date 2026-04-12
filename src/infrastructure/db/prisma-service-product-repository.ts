import { ServiceProduct } from '../../domain/entities/service-product';
import { IServiceProductRepository } from '../../application/ports/iservice-product-repository';
import prisma from './prisma';

export class PrismaServiceProductRepository implements IServiceProductRepository {
  async create(serviceProduct: ServiceProduct): Promise<void> {
    await prisma.service_product.create({
      data: {
        serviceId: serviceProduct.serviceId,
        productId: serviceProduct.productId,
        quantity: serviceProduct.quantity,
      },
    });
  }

  async findAll(userId: number): Promise<ServiceProduct[]> {
    const raw = await prisma.service_product.findMany({
      where: { deletedAt: null, service: { userId, deletedAt: null } },
    });
    return raw.map((sp) => new ServiceProduct(sp.id, sp.serviceId, sp.productId, sp.quantity));
  }

  async findOne(id: number, userId: number): Promise<ServiceProduct | null> {
    const sp = await prisma.service_product.findFirst({
      where: { id, deletedAt: null, service: { userId } },
    });
    if (!sp) return null;
    return new ServiceProduct(sp.id, sp.serviceId, sp.productId, sp.quantity);
  }

  async update(serviceProduct: ServiceProduct, userId: number): Promise<void> {
    await prisma.service_product.updateMany({
      where: { id: serviceProduct.id, deletedAt: null, service: { userId } },
      data: {
        serviceId: serviceProduct.serviceId,
        productId: serviceProduct.productId,
        quantity: serviceProduct.quantity,
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.service_product.updateMany({
      where: { id, deletedAt: null, service: { userId } },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByServiceId(serviceId: number): Promise<void> {
    await prisma.service_product.updateMany({
      where: { serviceId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
