import { Router } from 'express';
import { GetDashboardUseCase } from '../application/use-cases/dashboard/get-dashboard-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';

const router = Router();

const getDashboardUseCase = new GetDashboardUseCase();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const data = await getDashboardUseCase.execute(req.user!.id);
    return res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
