export interface ProfessionalData {
  id?: number;
  businessId: number;
  userId?: number | null;
  name: string;
  hourlyCost?: number | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Professional {
  public readonly id?: number;
  public readonly businessId: number;
  public readonly userId: number | null;
  public readonly name: string;
  public readonly hourlyCost: number | null;
  public readonly isActive: boolean;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt: Date | null;

  constructor(data: ProfessionalData) {
    this.id = data.id;
    this.businessId = data.businessId;
    this.userId = data.userId ?? null;
    this.name = data.name;
    this.hourlyCost = data.hourlyCost ?? null;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  isValid(): boolean {
    return this.businessId > 0 && this.name.trim().length > 0;
  }
}
