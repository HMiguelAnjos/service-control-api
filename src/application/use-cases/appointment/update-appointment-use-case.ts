import { Appointment, AppointmentStatus, isAppointmentStatus } from '../../../domain/entities/appointment';
import { IAppointmentRepository, UpdateAppointmentInput } from '../../ports/iappointment-repository';
import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';
import {
  AppointmentConflictError,
  NotFoundError,
  ValidationError,
} from '../../../middlewares/errors/errors';

export interface UpdateAppointmentExecuteInput {
  id: number;
  userId: number;
  clientId?: number;
  procedureTypeId?: number | null;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  notes?: string | null;
}

export class UpdateAppointmentUseCase {
  constructor(
    private appointments: IAppointmentRepository,
    private blockedTimes: IBlockedTimeRepository,
  ) {}

  async execute(input: UpdateAppointmentExecuteInput): Promise<Appointment> {
    const existing = await this.appointments.findOne(input.id, input.userId);
    if (!existing) throw new NotFoundError('Agendamento');

    const newStart = input.startTime ?? existing.startTime;
    const newEnd = input.endTime ?? existing.endTime;
    if (newStart.getTime() >= newEnd.getTime()) {
      throw new ValidationError('Horário inválido (início precisa ser anterior ao fim).');
    }

    if (input.status && !isAppointmentStatus(input.status)) {
      throw new ValidationError('Status inválido.');
    }

    // Only re-validate conflicts when the time window actually changed.
    if (input.startTime || input.endTime) {
      const overlapping = await this.appointments.findOverlapping({
        userId: input.userId,
        start: newStart,
        end: newEnd,
        excludeId: input.id,
      });
      if (overlapping.length > 0) {
        throw new AppointmentConflictError({
          conflictingId: overlapping[0].id!,
          startTime: overlapping[0].startTime,
          endTime: overlapping[0].endTime,
        });
      }

      const blocks = await this.blockedTimes.findOverlapping(input.userId, newStart, newEnd);
      if (blocks.length > 0) {
        throw new AppointmentConflictError({
          startTime: blocks[0].startTime,
          endTime: blocks[0].endTime,
          reason: blocks[0].reason
            ? `Horário bloqueado: ${blocks[0].reason}`
            : 'Horário bloqueado.',
        });
      }
    }

    const patch: UpdateAppointmentInput = {
      clientId: input.clientId,
      procedureTypeId: input.procedureTypeId,
      startTime: input.startTime,
      endTime: input.endTime,
      status: input.status,
      notes: input.notes,
    };

    return this.appointments.update(input.id, input.userId, patch);
  }
}
