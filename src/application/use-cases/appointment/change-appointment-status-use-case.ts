import { Appointment, AppointmentStatus, isAppointmentStatus } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export class ChangeAppointmentStatusUseCase {
  constructor(private repo: IAppointmentRepository) {}

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

    return this.repo.update(id, userId, patch);
  }
}
