export class Client {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly phone?: string,
    public readonly email?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly deletedAt: Date | null = null
  ) {}

  isValid(): boolean {
    return this.name.length > 0;
  }
}
