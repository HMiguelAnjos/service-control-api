import { Appointment, AppointmentStatus } from '../../domain/entities/appointment';
import {
  IAppointmentRepository,
  ListAppointmentsFilter,
  UpdateAppointmentInput,
} from '../../application/ports/iappointment-repository';
import prisma from './prisma';

const ACTIVE_STATUSES: AppointmentStatus[] = ['scheduled', 'confirmed', 'in_progress', 'completed'];

function toEntity(r: any): Appointment {
  return new Appointment({
    id: r.id,
    userId: r.userId,
    clientId: r.clientId,
    procedureTypeId: r.procedureTypeId,
    serviceId: r.serviceId,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status as AppointmentStatus,
    notes: r.notes,
    googleEventId: r.googleEventId,
    googleCalendarId: r.googleCalendarId,
    googleSyncedAt: r.googleSyncedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    canceledAt: r.canceledAt,
    cancelReason: r.cancelReason,
  });
}

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async create(appointment: Appointment): Promise<Appointment> {
    const created = await prisma.appointment.create({
      data: {
        userId: appointment.userId,
        clientId: appointment.clientId,
        procedureTypeId: appointment.procedureTypeId ?? undefined,
        serviceId: appointment.serviceId ?? undefined,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        notes: appointment.notes ?? undefined,
      },
    });
    return toEntity(created);
  }

  async findOne(id: number, userId: number): Promise<Appointment | null> {
    const r = await prisma.appointment.findFirst({ where: { id, userId } });
    return r ? toEntity(r) : null;
  }

  async findByGoogleEventId(googleEventId: string, userId: number): Promise<Appointment | null> {
    const r = await prisma.appointment.findFirst({ where: { googleEventId, userId } });
    return r ? toEntity(r) : null;
  }

  async list(filter: ListAppointmentsFilter): Promise<Appointment[]> {
    const where: any = { userId: filter.userId };
    if (filter.from || filter.to) {
      where.startTime = {};
      if (filter.from) where.startTime.gte = filter.from;
      if (filter.to)   where.startTime.lte = filter.to;
    }
    if (filter.status) {
      where.status = Array.isArray(filter.status) ? { in: filter.status } : filter.status;
    }
    if (filter.clientId) where.clientId = filter.clientId;

    const rows = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
    return rows.map(toEntity);
  }

  async update(id: number, userId: number, input: UpdateAppointmentInput): Promise<Appointment> {
    const data: any = {};
    if (input.clientId !== undefined)        data.clientId = input.clientId;
    if (input.procedureTypeId !== undefined) data.procedureTypeId = input.procedureTypeId;
    if (input.startTime !== undefined)       data.startTime = input.startTime;
    if (input.endTime !== undefined)         data.endTime = input.endTime;
    if (input.status !== undefined)          data.status = input.status;
    if (input.notes !== undefined)           data.notes = input.notes;
    if (input.serviceId !== undefined)       data.serviceId = input.serviceId;
    if (input.googleEventId !== undefined)   data.googleEventId = input.googleEventId;
    if (input.googleCalendarId !== undefined) data.googleCalendarId = input.googleCalendarId;
    if (input.googleSyncedAt !== undefined)  data.googleSyncedAt = input.googleSyncedAt;
    if (input.canceledAt !== undefined)      data.canceledAt = input.canceledAt;
    if (input.cancelReason !== undefined)    data.cancelReason = input.cancelReason;

    const updated = await prisma.appointment.update({
      where: { id, userId } as any,
      data,
    }).catch(async () => {
      // `update` with composite where requires composite unique; emulate by 2 queries.
      const exists = await prisma.appointment.findFirst({ where: { id, userId } });
      if (!exists) throw new Error('Appointment not found');
      return prisma.appointment.update({ where: { id }, data });
    });
    return toEntity(updated);
  }

  async findOverlapping(input: { userId: number; start: Date; end: Date; excludeId?: number }): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: {
        userId: input.userId,
        status: { in: ACTIVE_STATUSES },
        startTime: { lt: input.end },
        endTime:   { gt: input.start },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      },
      orderBy: { startTime: 'asc' },
    });
    return rows.map(toEntity);
  }
}
