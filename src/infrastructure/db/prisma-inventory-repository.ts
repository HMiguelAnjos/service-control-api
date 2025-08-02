import { PrismaClient } from '@prisma/client';
import { Inventory } from '../../domain/entities/inventory';
import { IInventoryRepository } from '../../domain/repositories/iinventory-repository';

const prisma = new PrismaClient();

export class PrismaInventoryRepository implements IInventoryRepository {
  async create(inventory: Inventory): Promise<void> {
    await prisma.inventory.create({
      data: {
        productId: inventory.productId,
        quantity: inventory.quantity,
      },
    });
  }

  async findAll(): Promise<Inventory[]> {
    const rawInventories = await prisma.inventory.findMany({
      where: { deletedAt: null },
    });
    return rawInventories.map(
      (i: any) =>
        new Inventory(
          i.id,
          i.productId,
          i.quantity,
        )
    );
  }

  async update(inventory: Inventory): Promise<void> {
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        quantity: inventory.quantity,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.inventory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Inventory | null> {
    const raw = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new Inventory(
      raw.id,
      raw.productId,
      raw.quantity,
    );
  }
}
