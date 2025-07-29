export class ServiceProduct {
  constructor(
    public readonly id: number,
    public readonly serviceId: number,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.serviceId > 0 && this.productId.length > 0 && this.quantity > 0;
  }
}
