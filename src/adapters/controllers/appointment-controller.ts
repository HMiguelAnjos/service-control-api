import { NextFunction, Request, Response } from 'express';
import { Appointment, AppointmentStatus, isAppointmentStatus } from '../../domain/entities/appointment';
import { CreateAppointmentUseCase } from '../../application/use-cases/appointment/create-appointment-use-case';
import { ListAppointmentsUseCase } from '../../application/use-cases/appointment/list-appointments-use-case';
import { GetAppointmentUseCase } from '../../application/use-cases/appointment/get-appointment-use-case';
import { UpdateAppointmentUseCase } from '../../application/use-cases/appointment/update-appointment-use-case';
import { ChangeAppointmentStatusUseCase } from '../../application/use-cases/appointment/change-appointment-status-use-case';
import { CancelAppointmentUseCase } from '../../application/use-cases/appointment/cancel-appointment-use-case';
import { ListAvailableSlotsUseCase } from '../../application/use-cases/appointment/list-available-slots-use-case';
import { ValidationError } from '../../middlewares/errors/errors';

function serialise(a: Appointment) {
  return {
    id: a.id,
    userId: a.userId,
    clientId: a.clientId,
    procedureTypeId: a.procedureTypeId,
    serviceId: a.serviceId,
    startTime: a.startTime.toISOString(),
    endTime: a.endTime.toISOString(),
    status: a.status,
    notes: a.notes,
    googleEventId: a.googleEventId,
    googleSyncedAt: a.googleSyncedAt?.toISOString() ?? null,
    canceledAt: a.canceledAt?.toISOString() ?? null,
    cancelReason: a.cancelReason,
    createdAt: a.createdAt?.toISOString(),
    updatedAt: a.updatedAt?.toISOString(),
  };
}

function parseDate(input: unknown, field: string): Date {
  if (typeof input !== 'string') throw new ValidationError(`${field} é obrigatório.`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}
function parseOptionalDate(input: unknown, field: string): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  return parseDate(input, field);
}

export class AppointmentController {
  constructor(
    private createUC: CreateAppointmentUseCase,
    private listUC: ListAppointmentsUseCase,
    private getUC: GetAppointmentUseCase,
    private updateUC: UpdateAppointmentUseCase,
    private changeStatusUC: ChangeAppointmentStatusUseCase,
    private cancelUC: CancelAppointmentUseCase,
    private slotsUC: ListAvailableSlotsUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const body = req.body ?? {};

      const appt = await this.createUC.execute({
        userId,
        clientId: Number(body.clientId),
        procedureTypeId: body.procedureTypeId != null ? Number(body.procedureTypeId) : null,
        startTime: parseDate(body.startTime, 'startTime'),
        endTime: parseDate(body.endTime, 'endTime'),
        status: body.status,
        notes: body.notes ?? null,
      });
      return res.status(201).json(serialise(appt));
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { from, to, status, clientId } = req.query;
      const items = await this.listUC.execute({
        userId,
        from: parseOptionalDate(from, 'from'),
        to: parseOptionalDate(to, 'to'),
        status: status === undefined
          ? undefined
          : Array.isArray(status)
            ? (status as string[]).filter(isAppointmentStatus) as AppointmentStatus[]
            : isAppointmentStatus(status) ? status : undefined,
        clientId: clientId ? Number(clientId) : undefined,
      });
      return res.json(items.map(serialise));
    } catch (err) { next(err); }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      const appt = await this.getUC.execute(id, userId);
      return res.json(serialise(appt));
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      const body = req.body ?? {};
      const appt = await this.updateUC.execute({
        id, userId,
        clientId: body.clientId != null ? Number(body.clientId) : undefined,
        procedureTypeId: body.procedureTypeId === null
          ? null
          : body.procedureTypeId != null ? Number(body.procedureTypeId) : undefined,
        startTime: parseOptionalDate(body.startTime, 'startTime'),
        endTime:   parseOptionalDate(body.endTime, 'endTime'),
        status: body.status,
        notes: body.notes,
      });
      return res.json(serialise(appt));
    } catch (err) { next(err); }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      const status = req.body?.status as AppointmentStatus;
      if (!isAppointmentStatus(status)) throw new ValidationError('Status inválido.');
      const appt = await this.changeStatusUC.execute(id, userId, status, req.body?.cancelReason);
      return res.json(serialise(appt));
    } catch (err) { next(err); }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      const appt = await this.cancelUC.execute(id, userId, req.body?.reason);
      return res.json(serialise(appt));
    } catch (err) { next(err); }
  }

  async slots(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const date = parseDate(req.query.date, 'date');
      const durationMinutes = Number(req.query.durationMinutes ?? req.query.duration ?? 60);
      const stepMinutes = req.query.stepMinutes ? Number(req.query.stepMinutes) : undefined;
      if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        throw new ValidationError('durationMinutes inválido.');
      }
      const slots = await this.slotsUC.execute({ userId, date, durationMinutes, stepMinutes });
      return res.json(slots.map(s => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
      })));
    } catch (err) { next(err); }
  }
}
