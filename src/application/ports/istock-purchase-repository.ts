import { StockPurchase } from '../../domain/entities/stock-purchase';

export interface ListStockPurchasesFilter {
  businessId: number;
  productId?: number;
  from?: Date;
  to?: Date;
}

export interface IStockPurchaseRepository {
  /**
   * Atomic transaction that:
   *   1. inserts the stock_purchase row,
   *   2. recomputes `product.unitCost` using the weighted-average formula,
   *   3. increments `inventory.quantity` by the purchased amount (creating
   *      the inventory row on demand).
   * Returns the persisted purchase plus the resulting product unitCost so
   * the caller can echo it back to the client.
   */
  createWithWeightedAverage(input: StockPurchase): Promise<{
    purchase: StockPurchase;
    newUnitCost: number;
    newQuantity: number;
  }>;

  list(filter: ListStockPurchasesFilter): Promise<StockPurchase[]>;
  findOne(id: number, businessId: number): Promise<StockPurchase | null>;
}
