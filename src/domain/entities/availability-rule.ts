export interface AvailabilityRuleData {
  id?: number;
  userId: number;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  startMinutes: number; // minutes since midnight
  endMinutes: number;
  isActive?: boolean;
}

export class AvailabilityRule {
  public readonly id?: number;
  public readonly userId: number;
  public readonly dayOfWeek: number;
  public readonly startMinutes: number;
  public readonly endMinutes: number;
  public readonly isActive: boolean;

  constructor(data: AvailabilityRuleData) {
    this.id = data.id;
    this.userId = data.userId;
    this.dayOfWeek = data.dayOfWeek;
    this.startMinutes = data.startMinutes;
    this.endMinutes = data.endMinutes;
    this.isActive = data.isActive ?? true;
  }

  isValid(): boolean {
    return (
      this.userId > 0 &&
      this.dayOfWeek >= 0 &&
      this.dayOfWeek <= 6 &&
      this.startMinutes >= 0 &&
      this.startMinutes < 24 * 60 &&
      this.endMinutes > this.startMinutes &&
      this.endMinutes <= 24 * 60
    );
  }
}
