import { PrismaClient } from '@prisma/client';
import { Product } from '../../domain/entities/product';
import { IProductRepository } from '../../domain/repositories/iproduct-repository';

const prisma = new PrismaClient();

export class PrismaProductRepository implements IProductRepository {
  async create(product: Product): Promise<void> {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        unitCost: product.unitCost,
      },
    });
  }

  async findAll(): Promise<Product[]> {
    const rawProducts = await prisma.product.findMany({
      where: { deletedAt: null },
    });
    return rawProducts.map(
      (p: any) => new Product(p.id, p.name, p.unitCost.toNumber(), p.description ?? undefined),
    );
  }

  async update(product: Product): Promise<void> {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        unitCost: product.unitCost,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Product | null> {
    const raw = await prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!raw) return null;

    return new Product(raw.id, raw.name, raw.unitCost.toNumber(), raw.description ?? undefined);
  }
}
