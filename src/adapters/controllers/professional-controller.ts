import { NextFunction, Request, Response } from 'express';
import { Professional } from '../../domain/entities/professional';
import { CommissionRuleRow } from '../../application/ports/iprofessional-repository';
import { CreateProfessionalUseCase } from '../../application/use-cases/professional/create-professional-use-case';
import { UpdateProfessionalUseCase } from '../../application/use-cases/professional/update-professional-use-case';
import { ListProfessionalsUseCase } from '../../application/use-cases/professional/list-professionals-use-case';
import { DeleteProfessionalUseCase } from '../../application/use-cases/professional/delete-professional-use-case';
import { SetCommissionPercentUseCase } from '../../application/use-cases/professional/set-commission-percent-use-case';
import { ListCommissionRulesUseCase } from '../../application/use-cases/professional/list-commission-rules-use-case';
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

function serialise(p: Professional) {
  return {
    id: p.id,
    name: p.name,
    hourlyCost: p.hourlyCost,
    userId: p.userId,
    isActive: p.isActive,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}
function serialiseRule(r: CommissionRuleRow) {
  return {
    id: r.id,
    professionalId: r.professionalId,
    percent: r.percent,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export class ProfessionalController {
  constructor(
    private createUC: CreateProfessionalUseCase,
    private updateUC: UpdateProfessionalUseCase,
    private listUC: ListProfessionalsUseCase,
    private deleteUC: DeleteProfessionalUseCase,
    private setCommissionUC: SetCommissionPercentUseCase,
    private listRulesUC: ListCommissionRulesUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const body = req.body ?? {};
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        throw new ValidationError('name obrigatório.');
      }
      const pro = await this.createUC.execute({
        businessId,
        name: body.name,
        userId: body.userId != null ? Number(body.userId) : null,
        hourlyCost: body.hourlyCost != null ? Number(body.hourlyCost) : null,
        initialCommissionPercent:
          body.initialCommissionPercent != null ? Number(body.initialCommissionPercent) : null,
      });
      return res.status(201).json(serialise(pro));
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const body = req.body ?? {};
      const pro = await this.updateUC.execute({
        id,
        businessId,
        patch: {
          name: body.name,
          hourlyCost:
            body.hourlyCost === null
              ? null
              : body.hourlyCost != null
                ? Number(body.hourlyCost)
                : undefined,
          userId:
            body.userId === null ? null : body.userId != null ? Number(body.userId) : undefined,
          isActive: body.isActive,
        },
      });
      return res.json(serialise(pro));
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

  async setCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const percent = Number(req.body?.percent);
      if (!Number.isFinite(percent)) throw new ValidationError('percent obrigatório.');
      const rule = await this.setCommissionUC.execute({
        professionalId: id,
        businessId,
        percent,
        startDate: req.body?.startDate ? new Date(req.body.startDate) : undefined,
      });
      return res.status(201).json(serialiseRule(rule));
    } catch (err) {
      next(err);
    }
  }

  async listCommissionRules(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const id = Number(req.params.id);
      const rules = await this.listRulesUC.execute(id, businessId);
      return res.json(rules.map(serialiseRule));
    } catch (err) {
      next(err);
    }
  }
}
