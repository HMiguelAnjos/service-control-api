export const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'canceled',
  'no_show',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === 'string' && (APPOINTMENT_STATUSES as readonly string[]).includes(value);
}

export interface AppointmentData {
  id?: number;
  userId: number;
  clientId: number;
  procedureTypeId?: number | null;
  serviceId?: number | null;
  startTime: Date;
  endTime: Date;
  status?: AppointmentStatus;
  notes?: string | null;
  googleEventId?: string | null;
  googleCalendarId?: string | null;
  googleSyncedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
  cancelReason?: string | null;
}

export class Appointment {
  public readonly id?: number;
  public readonly userId: number;
  public readonly clientId: number;
  public readonly procedureTypeId: number | null;
  public readonly serviceId: number | null;
  public readonly startTime: Date;
  public readonly endTime: Date;
  public readonly status: AppointmentStatus;
  public readonly notes: string | null;
  public readonly googleEventId: string | null;
  public readonly googleCalendarId: string | null;
  public readonly googleSyncedAt: Date | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;
  public readonly canceledAt: Date | null;
  public readonly cancelReason: string | null;

  constructor(data: AppointmentData) {
    this.id = data.id;
    this.userId = data.userId;
    this.clientId = data.clientId;
    this.procedureTypeId = data.procedureTypeId ?? null;
    this.serviceId = data.serviceId ?? null;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.status = data.status ?? 'scheduled';
    this.notes = data.notes ?? null;
    this.googleEventId = data.googleEventId ?? null;
    this.googleCalendarId = data.googleCalendarId ?? null;
    this.googleSyncedAt = data.googleSyncedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.canceledAt = data.canceledAt ?? null;
    this.cancelReason = data.cancelReason ?? null;
  }

  isValid(): boolean {
    return (
      this.userId > 0 &&
      this.clientId > 0 &&
      this.startTime instanceof Date &&
      this.endTime instanceof Date &&
      this.startTime.getTime() < this.endTime.getTime()
    );
  }
}
