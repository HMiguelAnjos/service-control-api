import { Appointment, AppointmentStatus } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';

export interface ListAppointmentsInput {
  userId: number;
  from?: Date;
  to?: Date;
  status?: AppointmentStatus | AppointmentStatus[];
  clientId?: number;
}

export class ListAppointmentsUseCase {
  constructor(private repo: IAppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<Appointment[]> {
    return this.repo.list(input);
  }
}
