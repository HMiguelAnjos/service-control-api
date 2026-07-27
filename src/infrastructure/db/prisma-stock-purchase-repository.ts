import { StockPurchase } from '../../domain/entities/stock-purchase';
import {
  IStockPurchaseRepository,
  ListStockPurchasesFilter,
} from '../../application/ports/istock-purchase-repository';
import prisma from './prisma';
import { NotFoundError, ValidationError } from '../../middlewares/errors/errors';

function toEntity(r: any): StockPurchase {
  return new StockPurchase({
    id: r.id,
    businessId: r.businessId,
    productId: r.productId,
    quantity: Number(r.quantity),
    unitCost: Number(r.unitCost),
    totalCost: Number(r.totalCost),
    supplier: r.supplier,
    notes: r.notes,
    purchasedAt: r.purchasedAt,
    createdAt: r.createdAt,
  });
}

/**
 * Rounds to 4 decimals — enough precision for the weighted-average
 * calculation without accumulating float drift across many purchases.
 */
function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000;
}

export class PrismaStockPurchaseRepository implements IStockPurchaseRepository {
  async createWithWeightedAverage(input: StockPurchase): Promise<{
    purchase: StockPurchase;
    newUnitCost: number;
    newQuantity: number;
  }> {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: input.productId,
          businessId: input.businessId,
          deletedAt: null,
        },
        include: { inventory: true },
      });
      if (!product) {
        throw new NotFoundError('Produto');
      }

      const currentQty = product.inventory ? Number(product.inventory.quantity) : 0;
      const currentUnitCost = Number(product.unitCost);
      const purchaseQty = input.quantity;
      const purchaseCost = input.unitCost;

      const totalQtyAfter = currentQty + purchaseQty;
      if (totalQtyAfter <= 0) {
        // Guard rail — should be impossible since input.quantity > 0 was
        // validated by the entity, but belt-and-suspenders against
        // divide-by-zero.
        throw new ValidationError('Quantidade total inválida após a compra.');
      }

      // Fórmula do custo médio ponderado (regra 2):
      //   novo = (estoque * custo_atual + qtd * custo_da_compra) / (estoque + qtd)
      const newUnitCost = round4(
        (currentQty * currentUnitCost + purchaseQty * purchaseCost) / totalQtyAfter,
      );

      // 1. Registra a compra (histórico imutável).
      const created = await tx.stock_purchase.create({
        data: {
          businessId: input.businessId,
          productId: input.productId,
          quantity: input.quantity,
          unitCost: input.unitCost,
          totalCost: input.totalCost,
          supplier: input.supplier ?? undefined,
          notes: input.notes ?? undefined,
          purchasedAt: input.purchasedAt,
        },
      });

      // 2. Atualiza o custo médio no product.
      await tx.product.update({
        where: { id: product.id },
        data: { unitCost: newUnitCost },
      });

      // 3. Incrementa (ou cria) o inventory.
      if (product.inventory) {
        await tx.inventory.update({
          where: { id: product.inventory.id },
          data: {
            quantity: totalQtyAfter,
            purchasePrice: input.unitCost,
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId: product.id,
            quantity: purchaseQty,
            purchasePrice: input.unitCost,
          },
        });
      }

      return {
        purchase: toEntity(created),
        newUnitCost,
        newQuantity: totalQtyAfter,
      };
    });
  }

  async list(filter: ListStockPurchasesFilter): Promise<StockPurchase[]> {
    const where: any = { businessId: filter.businessId };
    if (filter.productId) where.productId = filter.productId;
    if (filter.from || filter.to) {
      where.purchasedAt = {};
      if (filter.from) where.purchasedAt.gte = filter.from;
      if (filter.to) where.purchasedAt.lte = filter.to;
    }
    const rows = await prisma.stock_purchase.findMany({
      where,
      orderBy: { purchasedAt: 'desc' },
    });
    return rows.map(toEntity);
  }

  async findOne(id: number, businessId: number): Promise<StockPurchase | null> {
    const r = await prisma.stock_purchase.findFirst({ where: { id, businessId } });
    return r ? toEntity(r) : null;
  }
}
