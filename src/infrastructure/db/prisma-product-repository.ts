import { Product } from '../../domain/entities/product';
import { IProductRepository } from '../../application/ports/iproduct-repository';
import prisma from './prisma';

function toEntity(p: any): Product {
  return new Product(p.id, p.userId, p.name, Number(p.unitCost), p.description ?? undefined, p.createdAt);
}

export class PrismaProductRepository implements IProductRepository {
  async create(product: Product): Promise<void> {
    await prisma.product.create({
      data: { userId: product.userId, name: product.name, description: product.description, unitCost: product.unitCost },
    });
  }

  async findAll(userId: number): Promise<Product[]> {
    const rows = await prisma.product.findMany({ where: { userId, deletedAt: null } });
    return rows.map(toEntity);
  }

  async findOne(id: number, userId: number): Promise<Product | null> {
    const raw = await prisma.product.findFirst({ where: { id, userId, deletedAt: null } });
    return raw ? toEntity(raw) : null;
  }

  async update(product: Product): Promise<void> {
    await prisma.product.updateMany({
      where: { id: product.id, userId: product.userId, deletedAt: null },
      data: { name: product.name, description: product.description, unitCost: product.unitCost },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.product.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } });
  }
}
