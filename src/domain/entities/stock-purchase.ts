export interface StockPurchaseData {
  id?: number;
  businessId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  totalCost?: number;
  supplier?: string | null;
  notes?: string | null;
  purchasedAt?: Date;
  createdAt?: Date;
}

/**
 * Registro imutável de uma compra de insumo.  Fonte de verdade do
 * histórico e do custo médio ponderado que o `product.unitCost` guarda.
 */
export class StockPurchase {
  public readonly id?: number;
  public readonly businessId: number;
  public readonly productId: number;
  public readonly quantity: number;
  public readonly unitCost: number;
  public readonly totalCost: number;
  public readonly supplier: string | null;
  public readonly notes: string | null;
  public readonly purchasedAt: Date;
  public readonly createdAt?: Date;

  constructor(data: StockPurchaseData) {
    this.id = data.id;
    this.businessId = data.businessId;
    this.productId = data.productId;
    this.quantity = data.quantity;
    this.unitCost = data.unitCost;
    this.totalCost = data.totalCost ?? +(data.quantity * data.unitCost).toFixed(2);
    this.supplier = data.supplier ?? null;
    this.notes = data.notes ?? null;
    this.purchasedAt = data.purchasedAt ?? new Date();
    this.createdAt = data.createdAt;
  }

  isValid(): boolean {
    return this.businessId > 0 && this.productId > 0 && this.quantity > 0 && this.unitCost >= 0;
  }
}
