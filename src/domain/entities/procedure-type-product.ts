export class ProcedureTypeProduct {
  constructor(
    public readonly id: number | undefined,
    public readonly procedureTypeId: number,
    public readonly productId: number,
    public readonly quantity: number,
    public readonly unitCost?: number,
    public readonly productName?: string,
  ) {}

  isValid(): boolean {
    return this.procedureTypeId > 0 && this.productId > 0 && this.quantity > 0;
  }
}
