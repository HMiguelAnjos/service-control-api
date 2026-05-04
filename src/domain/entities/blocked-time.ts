export interface BlockedTimeData {
  id?: number;
  userId: number;
  startTime: Date;
  endTime: Date;
  reason?: string | null;
  createdAt?: Date;
}

export class BlockedTime {
  public readonly id?: number;
  public readonly userId: number;
  public readonly startTime: Date;
  public readonly endTime: Date;
  public readonly reason: string | null;
  public readonly createdAt?: Date;

  constructor(data: BlockedTimeData) {
    this.id = data.id;
    this.userId = data.userId;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.reason = data.reason ?? null;
    this.createdAt = data.createdAt;
  }

  isValid(): boolean {
    return (
      this.userId > 0 &&
      this.startTime instanceof Date &&
      this.endTime instanceof Date &&
      this.startTime.getTime() < this.endTime.getTime()
    );
  }
}
