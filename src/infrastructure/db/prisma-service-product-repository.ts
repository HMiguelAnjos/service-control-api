import { PrismaClient } from '@prisma/client';
import { ServiceProduct } from '../../domain/entities/service-product';
import { IServiceProductRepository } from '../../domain/repositories/iservice-product-repository';

const prisma = new PrismaClient();

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

  async findAll(): Promise<ServiceProduct[]> {
    const raw = await prisma.service_product.findMany({
      where: { deletedAt: null },
    });
    return raw.map((sp: any) =>
      new ServiceProduct(
        sp.id,
        sp.serviceId,
        sp.productId,
        sp.quantity
      )
    );
  }

  async update(serviceProduct: ServiceProduct): Promise<void> {
    await prisma.service_product.update({
      where: { id: serviceProduct.id },
      data: {
        serviceId: serviceProduct.serviceId,
        productId: serviceProduct.productId,
        quantity: serviceProduct.quantity,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.service_product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<ServiceProduct | null> {
    const sp = await prisma.service_product.findUnique({
      where: { id },
    });

    if (!sp) return null;

    return new ServiceProduct(
      sp.id,
      sp.serviceId,
      sp.productId,
      sp.quantity
    );
  }
}
