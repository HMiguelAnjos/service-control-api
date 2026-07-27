import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { PrismaBusinessRepository } from '../infrastructure/db/prisma-business-repository';
import { GetBusinessUseCase } from '../application/use-cases/business/get-business-use-case';
import { UpdateBusinessUseCase } from '../application/use-cases/business/update-business-use-case';
import { ForbiddenError } from '../middlewares/errors/errors';

const router = Router();

const repo = new PrismaBusinessRepository();
const getUC = new GetBusinessUseCase(repo);
const updateUC = new UpdateBusinessUseCase(repo);

function requireBusinessId(req: any): number {
  const id = req.user?.businessId;
  if (!id) {
    throw new ForbiddenError(
      'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
    );
  }
  return id;
}

function serialise(b: any) {
  return {
    id: b.id,
    name: b.name,
    displayName: b.displayName,
    monthlyServiceEstimate: b.monthlyServiceEstimate,
    createdAt: b.createdAt?.toISOString(),
    updatedAt: b.updatedAt?.toISOString(),
  };
}

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const b = await getUC.execute(businessId);
    return res.json(serialise(b));
  } catch (err) {
    next(err);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const businessId = requireBusinessId(req);
    const body = req.body ?? {};
    const b = await updateUC.execute(businessId, {
      name: body.name,
      displayName: body.displayName,
      monthlyServiceEstimate:
        body.monthlyServiceEstimate === null
          ? null
          : body.monthlyServiceEstimate != null
            ? Number(body.monthlyServiceEstimate)
            : undefined,
    });
    return res.json(serialise(b));
  } catch (err) {
    next(err);
  }
});

export default router;
