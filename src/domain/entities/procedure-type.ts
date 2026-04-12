export class ProcedureType {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly name: string,
    public readonly description?: string
  ) {}

  isValid(): boolean {
    return this.userId > 0 && this.name.trim().length > 0;
  }
}
