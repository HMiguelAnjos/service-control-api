import { Appointment } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class GetAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}

  async execute(id: number, userId: number): Promise<Appointment> {
    const appt = await this.repo.findOne(id, userId);
    if (!appt) throw new NotFoundError('Agendamento');
    return appt;
  }
}
