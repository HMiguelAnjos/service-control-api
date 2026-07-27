export interface BusinessData {
  id?: number;
  name: string;
  displayName?: string | null;
  monthlyServiceEstimate?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Business {
  public readonly id?: number;
  public readonly name: string;
  public readonly displayName: string | null;
  public readonly monthlyServiceEstimate: number | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt: Date | null;

  constructor(data: BusinessData) {
    this.id = data.id;
    this.name = data.name;
    this.displayName = data.displayName ?? null;
    this.monthlyServiceEstimate = data.monthlyServiceEstimate ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
  }

  isValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      (this.monthlyServiceEstimate === null || this.monthlyServiceEstimate > 0)
    );
  }
}
