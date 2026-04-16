export class Expense {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly category: string,
    public readonly amount: number,
    public readonly serviceId?: number | null,
    public readonly notes?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null,
  ) {}

  isValid(): boolean {
    return this.amount > 0 && this.category.length > 0 && this.userId > 0;
  }
}
