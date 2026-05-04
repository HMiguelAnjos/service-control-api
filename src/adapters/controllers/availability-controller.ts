import { NextFunction, Request, Response } from 'express';
import { GetAvailabilityRulesUseCase } from '../../application/use-cases/availability/get-availability-rules-use-case';
import { ReplaceAvailabilityRulesUseCase } from '../../application/use-cases/availability/replace-availability-rules-use-case';
import { CreateBlockedTimeUseCase } from '../../application/use-cases/blocked-time/create-blocked-time-use-case';
import { ListBlockedTimesUseCase } from '../../application/use-cases/blocked-time/list-blocked-times-use-case';
import { DeleteBlockedTimeUseCase } from '../../application/use-cases/blocked-time/delete-blocked-time-use-case';
import { ValidationError } from '../../middlewares/errors/errors';

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

export class AvailabilityController {
  constructor(
    private getRules: GetAvailabilityRulesUseCase,
    private replaceRules: ReplaceAvailabilityRulesUseCase,
    private createBlocked: CreateBlockedTimeUseCase,
    private listBlocked: ListBlockedTimesUseCase,
    private deleteBlocked: DeleteBlockedTimeUseCase,
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const rules = await this.getRules.execute(userId);
      return res.json(rules.map(r => ({
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        startMinutes: r.startMinutes,
        endMinutes: r.endMinutes,
        isActive: r.isActive,
      })));
    } catch (err) { next(err); }
  }

  async replaceAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const rules = Array.isArray(req.body?.rules) ? req.body.rules : [];
      const saved = await this.replaceRules.execute({ userId, rules });
      return res.json(saved.map(r => ({
        id: r.id, dayOfWeek: r.dayOfWeek, startMinutes: r.startMinutes,
        endMinutes: r.endMinutes, isActive: r.isActive,
      })));
    } catch (err) { next(err); }
  }

  async createBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { startTime, endTime, reason } = req.body ?? {};
      const created = await this.createBlocked.execute({
        userId,
        startTime: parseDate(startTime, 'startTime'),
        endTime: parseDate(endTime, 'endTime'),
        reason,
      });
      return res.status(201).json({
        id: created.id,
        startTime: created.startTime.toISOString(),
        endTime: created.endTime.toISOString(),
        reason: created.reason,
        createdAt: created.createdAt?.toISOString(),
      });
    } catch (err) { next(err); }
  }

  async listBlocks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const from = parseOptionalDate(req.query.from, 'from');
      const to = parseOptionalDate(req.query.to, 'to');
      const items = await this.listBlocked.execute(userId, from, to);
      return res.json(items.map(b => ({
        id: b.id,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        reason: b.reason,
      })));
    } catch (err) { next(err); }
  }

  async deleteBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      await this.deleteBlocked.execute(id, userId);
      return res.status(204).send();
    } catch (err) { next(err); }
  }
}
