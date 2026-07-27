import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';

import { PrismaStockPurchaseRepository } from '../infrastructure/db/prisma-stock-purchase-repository';
import { RegisterStockPurchaseUseCase } from '../application/use-cases/stock-purchase/register-stock-purchase-use-case';
import { ListStockPurchasesUseCase } from '../application/use-cases/stock-purchase/list-stock-purchases-use-case';
import { StockPurchaseController } from '../adapters/controllers/stock-purchase-controller';

const router = Router();

const repo = new PrismaStockPurchaseRepository();
const controller = new StockPurchaseController(
  new RegisterStockPurchaseUseCase(repo),
  new ListStockPurchasesUseCase(repo),
);

router.use(authMiddleware);
router.use(requirePlanFeature('inventory'));

router.post('/', (req, res, next) => controller.register(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));

export default router;
