import { Appointment, AppointmentStatus, isAppointmentStatus } from '../../../domain/entities/appointment';
import { IAppointmentRepository } from '../../ports/iappointment-repository';
import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';
import {
  AppointmentConflictError,
  ValidationError,
} from '../../../middlewares/errors/errors';

export interface CreateAppointmentInput {
  userId: number;
  clientId: number;
  procedureTypeId?: number | null;
  startTime: Date;
  endTime: Date;
  status?: AppointmentStatus;
  notes?: string | null;
}

export class CreateAppointmentUseCase {
  constructor(
    private appointments: IAppointmentRepository,
    private blockedTimes: IBlockedTimeRepository,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    if (input.status && !isAppointmentStatus(input.status)) {
      throw new ValidationError('Status inválido.');
    }

    const entity = new Appointment({
      userId: input.userId,
      clientId: input.clientId,
      procedureTypeId: input.procedureTypeId ?? null,
      startTime: input.startTime,
      endTime: input.endTime,
      status: input.status ?? 'scheduled',
      notes: input.notes ?? null,
    });

    if (!entity.isValid()) {
      throw new ValidationError('Horário do agendamento inválido (início precisa ser anterior ao fim).');
    }

    const overlapping = await this.appointments.findOverlapping({
      userId: input.userId,
      start: input.startTime,
      end: input.endTime,
    });
    if (overlapping.length > 0) {
      throw new AppointmentConflictError({
        conflictingId: overlapping[0].id!,
        startTime: overlapping[0].startTime,
        endTime: overlapping[0].endTime,
      });
    }

    const blocks = await this.blockedTimes.findOverlapping(input.userId, input.startTime, input.endTime);
    if (blocks.length > 0) {
      throw new AppointmentConflictError({
        startTime: blocks[0].startTime,
        endTime: blocks[0].endTime,
        reason: blocks[0].reason
          ? `Horário bloqueado: ${blocks[0].reason}`
          : 'Horário bloqueado.',
      });
    }

    return this.appointments.create(entity);
  }
}
