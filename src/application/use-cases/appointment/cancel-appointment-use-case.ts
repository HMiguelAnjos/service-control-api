import { Appointment } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { AppointmentGoogleSync } from '../../services/appointment-google-sync';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class CancelAppointmentUseCase {
  constructor(
    private repo: IAppointmentRepository,
    private googleSync?: AppointmentGoogleSync,
  ) {}

  async execute(id: number, userId: number, reason?: string): Promise<Appointment> {
    const existing = await this.repo.findOne(id, userId);
    if (!existing) throw new NotFoundError('Agendamento');

    const updated = await this.repo.update(id, userId, {
      status: 'canceled',
      canceledAt: new Date(),
      cancelReason: reason ?? null,
    });

    if (this.googleSync) await this.googleSync.onCanceled(updated);
    return updated;
  }
}
