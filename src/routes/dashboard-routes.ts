import { Router } from 'express';
import { GetDashboardUseCase } from '../application/use-cases/dashboard/get-dashboard-use-case';
import { GetBreakEvenUseCase } from '../application/use-cases/dashboard/get-break-even-use-case';
import { PrismaFixedCostRepository } from '../infrastructure/db/prisma-fixed-cost-repository';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { ForbiddenError } from '../middlewares/errors/errors';

const router = Router();

const fixedCostRepo = new PrismaFixedCostRepository();
const getDashboardUseCase = new GetDashboardUseCase();
const getBreakEvenUseCase = new GetBreakEvenUseCase(fixedCostRepo);

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const data = await getDashboardUseCase.execute(req.user!.id);
    return res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/break-even', async (req, res, next) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      throw new ForbiddenError(
        'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
      );
    }
    const result = await getBreakEvenUseCase.execute(businessId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
