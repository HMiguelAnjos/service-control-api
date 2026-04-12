export class Service {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly clientId: number,
    public readonly procedureId: number,
    public readonly price: number,
    public readonly date: Date = new Date(),
    public readonly description?: string | null
  ) {}

  isValid(): boolean {
    return (
      this.userId > 0 &&
      this.clientId > 0 &&
      this.procedureId > 0 &&
      this.price > 0
    );
  }
}
