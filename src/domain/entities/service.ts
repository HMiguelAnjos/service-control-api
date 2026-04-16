export interface ServiceProcedureInput {
  procedureTypeId: number;
  price: number;
}

export class Service {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly clientId: number,
    public readonly totalPrice: number,
    public readonly date: Date = new Date(),
    public readonly description?: string | null,
    public readonly procedures?: ServiceProcedureInput[],
  ) {}

  isValid(): boolean {
    return (
      this.userId > 0 &&
      this.clientId > 0 &&
      this.totalPrice > 0
    );
  }
}
