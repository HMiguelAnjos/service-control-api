export class Inventory {
  constructor(
    public readonly id: number | undefined,
    public readonly productId: number,
    public readonly quantity: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.productId > 0 && this.quantity >= 0;
  }
}
