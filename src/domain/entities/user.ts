export class User {
  constructor(
    public readonly id: number | undefined,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  isValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.email.includes('@') &&
      this.passwordHash.length > 0
    );
  }
}
