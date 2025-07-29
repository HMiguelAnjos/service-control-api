export class Service {
  constructor(
    public readonly id: number,
    public readonly clientId: number,
    public readonly procedureId: number,
    public readonly description: string,
    public readonly price: number,
    public readonly date: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.clientId > 0 && this.procedureId > 0 && this.price > 0;
  }
}
