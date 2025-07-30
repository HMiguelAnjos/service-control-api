export class Profit {
  constructor(
    public readonly id: number | undefined,
    public readonly serviceId: number,
    public readonly totalProfit: number,
    public readonly marginPct: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.serviceId > 0 && this.totalProfit >= 0 && this.marginPct >= 0;
  }
}
