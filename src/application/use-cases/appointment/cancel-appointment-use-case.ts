import { Appointment } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class CancelAppointmentUseCase {
  constructor(private repo: IAppointmentRepository) {}

  async execute(id: number, userId: number, reason?: string): Promise<Appointment> {
    const existing = await this.repo.findOne(id, userId);
    if (!existing) throw new NotFoundError('Agendamento');

    return this.repo.update(id, userId, {
      status: 'canceled',
      canceledAt: new Date(),
      cancelReason: reason ?? null,
    });
  }
}
