export class ProcedureType {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.name.length > 0;
  }
}
