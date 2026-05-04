import { Appointment, AppointmentStatus } from '../../domain/entities/appointment';

export interface ListAppointmentsFilter {
  userId: number;
  from?: Date;
  to?: Date;
  status?: AppointmentStatus | AppointmentStatus[];
  clientId?: number;
}

export interface UpdateAppointmentInput {
  clientId?: number;
  procedureTypeId?: number | null;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  notes?: string | null;
  serviceId?: number | null;
  googleEventId?: string | null;
  googleCalendarId?: string | null;
  googleSyncedAt?: Date | null;
  canceledAt?: Date | null;
  cancelReason?: string | null;
}

export interface IAppointmentRepository {
  create(appointment: Appointment): Promise<Appointment>;
  findOne(id: number, userId: number): Promise<Appointment | null>;
  findByGoogleEventId(googleEventId: string, userId: number): Promise<Appointment | null>;
  list(filter: ListAppointmentsFilter): Promise<Appointment[]>;
  update(id: number, userId: number, input: UpdateAppointmentInput): Promise<Appointment>;
  /**
   * Returns appointments that overlap [start, end) for the given user, excluding
   * canceled/no-show. Used for conflict detection.  Optionally exclude a given
   * appointment id (used when reagendando o próprio compromisso).
   */
  findOverlapping(input: {
    userId: number;
    start: Date;
    end: Date;
    excludeId?: number;
  }): Promise<Appointment[]>;
}
