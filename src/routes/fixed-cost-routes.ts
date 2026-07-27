import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validateId } from '../middlewares/validation/validate';
import { PrismaFixedCostRepository } from '../infrastructure/db/prisma-fixed-cost-repository';
import { CreateFixedCostUseCase } from '../application/use-cases/fixed-cost/create-fixed-cost-use-case';
import { UpdateFixedCostUseCase } from '../application/use-cases/fixed-cost/update-fixed-cost-use-case';
import { ListFixedCostsUseCase } from '../application/use-cases/fixed-cost/list-fixed-costs-use-case';
import { DeleteFixedCostUseCase } from '../application/use-cases/fixed-cost/delete-fixed-cost-use-case';
import { ForbiddenError, ValidationError } from '../middlewares/errors/errors';

const router = Router();

const repo = new PrismaFixedCostRepository();
const createUC = new CreateFixedCostUseCase(repo);
const updateUC = new UpdateFixedCostUseCase(repo);
const listUC = new ListFixedCostsUseCase(repo);
const deleteUC = new DeleteFixedCostUseCase(repo);

function requireBusinessId(req: any): number {
  const id = req.user?.businessId;
  if (!id) {
    throw new ForbiddenError(
      'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
    );
  }
  return id;
}

function serialise(fc: any) {
  return {
    id: fc.id,
    name: fc.name,
    monthlyAmount: fc.monthlyAmount,
    startDate: fc.startDate?.toISOString(),
    endDate: fc.endDate?.toISOString() ?? null,
    isActive: fc.isActive,
    createdAt: fc.createdAt?.toISOString(),
    updatedAt: fc.updatedAt?.toISOString(),
  };
}

function parseOptionalDate(v: any, field: string): Date | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string') throw new ValidationError(`${field} inválida.`);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const includeInactive = String(req.query.includeInactive ?? '').toLowerCase() === 'true';
    const items = await listUC.execute(businessId, includeInactive);
    return res.json(items.map(serialise));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const body = req.body ?? {};
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new ValidationError('name obrigatório.');
    }
    const monthlyAmount = Number(body.monthlyAmount);
    if (!Number.isFinite(monthlyAmount) || monthlyAmount < 0) {
      throw new ValidationError('monthlyAmount inválido.');
    }
    const fc = await createUC.execute({
      businessId,
      name: body.name.trim(),
      monthlyAmount,
      startDate: parseOptionalDate(body.startDate, 'startDate'),
      endDate: body.endDate === null ? null : parseOptionalDate(body.endDate, 'endDate'),
    });
    return res.status(201).json(serialise(fc));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validateId, async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const id = Number(req.params.id);
    const body = req.body ?? {};
    const fc = await updateUC.execute({
      id,
      businessId,
      patch: {
        name: body.name,
        monthlyAmount: body.monthlyAmount != null ? Number(body.monthlyAmount) : undefined,
        startDate: parseOptionalDate(body.startDate, 'startDate'),
        endDate: body.endDate === null ? null : parseOptionalDate(body.endDate, 'endDate'),
        isActive: body.isActive,
      },
    });
    return res.json(serialise(fc));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', validateId, async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const id = Number(req.params.id);
    await deleteUC.execute(id, businessId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
