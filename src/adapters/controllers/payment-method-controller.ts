import { NextFunction, Request, Response } from 'express';
import { PaymentMethod } from '../../domain/entities/payment-method';
import { CreatePaymentMethodUseCase } from '../../application/use-cases/payment-method/create-payment-method-use-case';
import { UpdatePaymentMethodUseCase } from '../../application/use-cases/payment-method/update-payment-method-use-case';
import { ListPaymentMethodsUseCase } from '../../application/use-cases/payment-method/list-payment-methods-use-case';
import { DeletePaymentMethodUseCase } from '../../application/use-cases/payment-method/delete-payment-method-use-case';
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

function serialise(pm: PaymentMethod) {
  return {
    id: pm.id,
    name: pm.name,
    feePercent: pm.feePercent,
    receiptDays: pm.receiptDays,
    isActive: pm.isActive,
    createdAt: pm.createdAt?.toISOString(),
    updatedAt: pm.updatedAt?.toISOString(),
  };
}

export class PaymentMethodController {
  constructor(
    private createUC: CreatePaymentMethodUseCase,
    private updateUC: UpdatePaymentMethodUseCase,
    private listUC: ListPaymentMethodsUseCase,
    private deleteUC: DeletePaymentMethodUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const { name, feePercent, receiptDays } = req.body ?? {};
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('name obrigatório.');
      }
      const fee = Number(feePercent);
      const days = Number(receiptDays);
      if (!Number.isFinite(fee) || fee < 0 || fee > 100) {
        throw new ValidationError('feePercent deve ficar entre 0 e 100.');
      }
      if (!Number.isFinite(days) || days < 0) {
        throw new ValidationError('receiptDays precisa ser ≥ 0.');
      }
      const pm = await this.createUC.execute({
        businessId,
        name: name.trim(),
        feePercent: fee,
        receiptDays: days,
      });
      return res.status(201).json(serialise(pm));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const body = req.body ?? {};
      const pm = await this.updateUC.execute({
        id,
        businessId,
        name: body.name,
        feePercent: body.feePercent != null ? Number(body.feePercent) : undefined,
        receiptDays: body.receiptDays != null ? Number(body.receiptDays) : undefined,
        isActive: body.isActive,
      });
      return res.json(serialise(pm));
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const includeInactive = String(req.query.includeInactive ?? '').toLowerCase() === 'true';
      const items = await this.listUC.execute(businessId, includeInactive);
      return res.json(items.map(serialise));
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      await this.deleteUC.execute(id, businessId);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
