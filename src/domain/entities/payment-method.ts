export interface PaymentMethodData {
  id?: number;
  businessId: number;
  name: string;
  feePercent: number;
  receiptDays: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class PaymentMethod {
  public readonly id?: number;
  public readonly businessId: number;
  public readonly name: string;
  public readonly feePercent: number;
  public readonly receiptDays: number;
  public readonly isActive: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt: Date | null;

  constructor(data: PaymentMethodData) {
    this.id = data.id;
    this.businessId = data.businessId;
    this.name = data.name;
    this.feePercent = data.feePercent;
    this.receiptDays = data.receiptDays;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  isValid(): boolean {
    return (
      this.businessId > 0 &&
      this.name.trim().length > 0 &&
      this.feePercent >= 0 &&
      this.feePercent <= 100 &&
      this.receiptDays >= 0
    );
  }
}
