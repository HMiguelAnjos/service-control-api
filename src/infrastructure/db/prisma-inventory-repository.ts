import { Inventory } from '../../domain/entities/inventory';
import { IInventoryRepository } from '../../application/ports/iinventory-repository';
import prisma from './prisma';

export class PrismaInventoryRepository implements IInventoryRepository {
  async create(inventory: Inventory): Promise<void> {
    await prisma.inventory.create({
      data: {
        productId: inventory.productId,
        quantity: inventory.quantity,
      },
    });
  }

  async findAll(userId: number): Promise<Inventory[]> {
    const rawInventories = await prisma.inventory.findMany({
      where: { deletedAt: null, product: { userId, deletedAt: null } },
    });
    return rawInventories.map((i) => new Inventory(i.id, i.productId, i.quantity));
  }

  async findOne(id: number, userId: number): Promise<Inventory | null> {
    const raw = await prisma.inventory.findFirst({
      where: { id, deletedAt: null, product: { userId } },
    });
    if (!raw) return null;
    return new Inventory(raw.id, raw.productId, raw.quantity);
  }

  async update(inventory: Inventory, userId: number): Promise<void> {
    await prisma.inventory.updateMany({
      where: { id: inventory.id, deletedAt: null, product: { userId } },
      data: { quantity: inventory.quantity },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.inventory.updateMany({
      where: { id, deletedAt: null, product: { userId } },
      data: { deletedAt: new Date() },
    });
  }
}
