import { Inventory } from '../../domain/entities/inventory';
import { IInventoryRepository } from '../../application/ports/iinventory-repository';
import prisma from './prisma';

function toEntity(i: {
  id: number; productId: number; quantity: number; purchasePrice: any;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
}): Inventory {
  return new Inventory(
    i.id, i.productId, i.quantity,
    i.purchasePrice != null ? Number(i.purchasePrice) : undefined,
    i.createdAt, i.updatedAt, i.deletedAt,
  );
}

export class PrismaInventoryRepository implements IInventoryRepository {
  async create(inventory: Inventory): Promise<void> {
    await prisma.inventory.create({
      data: { productId: inventory.productId, quantity: inventory.quantity, purchasePrice: inventory.purchasePrice },
    });
  }

  async findAll(userId: number): Promise<Inventory[]> {
    const rows = await prisma.inventory.findMany({ where: { deletedAt: null, product: { userId, deletedAt: null } } });
    return rows.map(toEntity);
  }

  async findOne(id: number, userId: number): Promise<Inventory | null> {
    const raw = await prisma.inventory.findFirst({ where: { id, deletedAt: null, product: { userId } } });
    return raw ? toEntity(raw) : null;
  }

  async findByProductId(productId: number, userId: number): Promise<Inventory | null> {
    const raw = await prisma.inventory.findFirst({ where: { productId, deletedAt: null, product: { userId } } });
    return raw ? toEntity(raw) : null;
  }

  async update(inventory: Inventory, userId: number): Promise<void> {
    await prisma.inventory.updateMany({
      where: { id: inventory.id, deletedAt: null, product: { userId } },
      data: { quantity: inventory.quantity, purchasePrice: inventory.purchasePrice ?? undefined },
    });
  }

  async deductQuantity(productId: number, quantity: number, userId: number): Promise<void> {
    const inv = await this.findByProductId(productId, userId);
    if (!inv || inv.id == null) return;
    const newQty = Math.max(0, inv.quantity - Math.ceil(quantity));
    await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: newQty } });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.inventory.updateMany({ where: { id, deletedAt: null, product: { userId } }, data: { deletedAt: new Date() } });
  }
}
