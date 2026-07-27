export interface FixedCostData {
  id?: number;
  businessId: number;
  name: string;
  monthlyAmount: number;
  startDate?: Date;
  endDate?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FixedCost {
  public readonly id?: number;
  public readonly businessId: number;
  public readonly name: string;
  public readonly monthlyAmount: number;
  public readonly startDate: Date;
  public readonly endDate: Date | null;
  public readonly isActive: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(data: FixedCostData) {
    this.id = data.id;
    this.businessId = data.businessId;
    this.name = data.name;
    this.monthlyAmount = data.monthlyAmount;
    this.startDate = data.startDate ?? new Date();
    this.endDate = data.endDate ?? null;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isValid(): boolean {
    return (
      this.businessId > 0 &&
      this.name.trim().length > 0 &&
      this.monthlyAmount >= 0 &&
      (this.endDate === null || this.endDate.getTime() >= this.startDate.getTime())
    );
  }
}
