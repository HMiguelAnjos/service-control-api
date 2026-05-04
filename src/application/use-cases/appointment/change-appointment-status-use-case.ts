import { Appointment, AppointmentStatus, isAppointmentStatus } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { AppointmentGoogleSync } from '../../services/appointment-google-sync';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export class ChangeAppointmentStatusUseCase {
  constructor(
    private repo: IAppointmentRepository,
    private googleSync?: AppointmentGoogleSync,
  ) {}

  async execute(id: number, userId: number, status: AppointmentStatus, cancelReason?: string): Promise<Appointment> {
    if (!isAppointmentStatus(status)) {
      throw new ValidationError('Status inválido.');
    }

    const existing = await this.repo.findOne(id, userId);
    if (!existing) throw new NotFoundError('Agendamento');

    const patch: Parameters<IAppointmentRepository['update']>[2] = { status };
    if (status === 'canceled') {
      patch.canceledAt = new Date();
      patch.cancelReason = cancelReason ?? null;
    }

    const updated = await this.repo.update(id, userId, patch);

    if (this.googleSync && status === 'canceled') {
      await this.googleSync.onCanceled(updated);
    }
    return updated;
  }
}
