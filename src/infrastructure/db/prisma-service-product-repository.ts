import { ServiceProduct } from '../../domain/entities/service-product';
import { IServiceProductRepository } from '../../application/ports/iservice-product-repository';
import prisma from './prisma';

function toEntity(sp: { id: number; serviceId: number; productId: number; quantity: any }): ServiceProduct {
  return new ServiceProduct(sp.id, sp.serviceId, sp.productId, Number(sp.quantity));
}

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
    return raw.map(toEntity);
  }

  async findOne(id: number, userId: number): Promise<ServiceProduct | null> {
    const sp = await prisma.service_product.findFirst({
      where: { id, deletedAt: null, service: { userId } },
    });
    if (!sp) return null;
    return toEntity(sp);
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
