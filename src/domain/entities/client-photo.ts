export class ClientPhoto {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number,
    public readonly clientId: number,
    public readonly filename: string,
    public readonly takenAt: Date,
    public readonly createdAt?: Date,
  ) {}
}
