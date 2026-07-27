import { NextFunction, Request, Response } from 'express';
import { CreateDraftServiceUseCase } from '../../application/use-cases/service/create-draft-service-use-case';
import { ConfirmServiceUseCase } from '../../application/use-cases/service/confirm-service-use-case';
import { ForbiddenError, ValidationError } from '../../middlewares/errors/errors';

function requireBusinessId(req: Request): number {
  const id = req.user?.businessId;
  if (!id) {
    throw new ForbiddenError(
      'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
    );
  }
  return id;
}

function parseDate(input: unknown, field: string): Date {
  if (typeof input !== 'string') throw new ValidationError(`${field} inválida.`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}
function parseOptionalDate(input: unknown, field: string): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  return parseDate(input, field);
}

export class ServiceDraftController {
  constructor(
    private draftUC: CreateDraftServiceUseCase,
    private confirmUC: ConfirmServiceUseCase,
  ) {}

  /**
   * POST /services/draft
   * Body: { clientId, procedureTypeIds[], professionalId?, date?, durationMinutes?, description? }
   */
  async draft(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const userId = req.user!.id;
      const body = req.body ?? {};

      const clientId = Number(body.clientId);
      if (!Number.isFinite(clientId) || clientId <= 0) {
        throw new ValidationError('clientId obrigatório.');
      }

      const procedureTypeIds: number[] = Array.isArray(body.procedureTypeIds)
        ? body.procedureTypeIds.map((x: unknown) => Number(x))
        : [];
      if (procedureTypeIds.some((n: number) => !Number.isFinite(n) || n <= 0)) {
        throw new ValidationError('procedureTypeIds deve ser um array de ids válidos.');
      }

      const durationMinutes = body.durationMinutes != null ? Number(body.durationMinutes) : null;

      const draft = await this.draftUC.execute({
        businessId,
        userId,
        clientId,
        professionalId: body.professionalId != null ? Number(body.professionalId) : null,
        procedureTypeIds,
        date: parseOptionalDate(body.date, 'date'),
        durationMinutes,
        description: body.description ?? null,
      });

      return res.status(201).json(draft);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /services/:id/confirm
   * Body: { productLines[], durationMinutes?, payments[], totalPrice? }
   */
  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const serviceId = Number(req.params.id);
      const body = req.body ?? {};

      const productLines = Array.isArray(body.productLines)
        ? body.productLines.map((l: any) => ({
            productId: Number(l.productId),
            realQuantity: Number(l.realQuantity),
          }))
        : [];
      if (
        productLines.some(
          (l: any) => !Number.isFinite(l.productId) || !Number.isFinite(l.realQuantity),
        )
      ) {
        throw new ValidationError('productLines com item inválido.');
      }

      const payments = Array.isArray(body.payments)
        ? body.payments.map((p: any) => ({
            paymentMethodId: Number(p.paymentMethodId),
            amount: Number(p.amount),
          }))
        : [];
      if (payments.length === 0) {
        throw new ValidationError('Ao menos uma forma de pagamento é obrigatória.');
      }
      if (
        payments.some(
          (p: any) =>
            !Number.isFinite(p.paymentMethodId) || !Number.isFinite(p.amount) || p.amount <= 0,
        )
      ) {
        throw new ValidationError('payments com item inválido.');
      }

      const durationMinutes =
        body.durationMinutes != null ? Number(body.durationMinutes) : undefined;
      const totalPrice = body.totalPrice != null ? Number(body.totalPrice) : undefined;

      const confirmed = await this.confirmUC.execute({
        serviceId,
        businessId,
        productLines,
        durationMinutes,
        payments,
        totalPrice,
      });

      return res.json(confirmed);
    } catch (err) {
      next(err);
    }
  }
}
