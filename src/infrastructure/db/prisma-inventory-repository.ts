import { Inventory } from '../../domain/entities/inventory';
import { IInventoryRepository } from '../../application/ports/iinventory-repository';
import prisma from './prisma';
import { InsufficientStockError } from '../../middlewares/errors/errors';

function toEntity(i: {
  id: number; productId: number; quantity: any; purchasePrice: any;
  createdAt: Date; updatedAt: Date; deletedAt: Date | null;
}): Inventory {
  return new Inventory(
    i.id, i.productId, Number(i.quantity),
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
    const inv = await prisma.inventory.findFirst({
      where: { productId, deletedAt: null, product: { userId } },
      include: { product: { select: { name: true } } },
    });
    // Silently skip if there's no inventory record at all — product was never stocked.
    if (!inv) return;

    const available = Number(inv.quantity);
    if (available < quantity) {
      throw new InsufficientStockError({
        productId,
        productName: inv.product?.name,
        requested: quantity,
        available,
      });
    }

    const newQty = Math.round((available - quantity) * 1000) / 1000;
    await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: newQty } });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.inventory.updateMany({ where: { id, deletedAt: null, product: { userId } }, data: { deletedAt: new Date() } });
  }
}
