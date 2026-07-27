import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validateId } from '../middlewares/validation/validate';

import { PrismaServicePaymentRepository } from '../infrastructure/db/prisma-service-payment-repository';
import { ReceiveServicePaymentUseCase } from '../application/use-cases/service-payment/receive-service-payment-use-case';
import { ClearServicePaymentUseCase } from '../application/use-cases/service-payment/clear-service-payment-use-case';
import { GetCashFlowProjectionUseCase } from '../application/use-cases/service-payment/get-cash-flow-projection-use-case';
import { ListDivergencesUseCase } from '../application/use-cases/service-payment/list-divergences-use-case';
import { ListServicePaymentsUseCase } from '../application/use-cases/service-payment/list-service-payments-use-case';
import { ServicePaymentController } from '../adapters/controllers/service-payment-controller';

const router = Router();

const repo = new PrismaServicePaymentRepository();
const controller = new ServicePaymentController(
  new ReceiveServicePaymentUseCase(repo),
  new ClearServicePaymentUseCase(repo),
  new GetCashFlowProjectionUseCase(repo),
  new ListDivergencesUseCase(repo),
  new ListServicePaymentsUseCase(repo),
);

router.use(authMiddleware);

// Dashboard-oriented endpoints come first so they're not shadowed by /:id.
router.get('/cash-flow', (req, res, next) => controller.cashFlow(req, res, next));
router.get('/divergences', (req, res, next) => controller.divergences(req, res, next));

router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/:id/receive', validateId, (req, res, next) => controller.receive(req, res, next));
router.post('/:id/clear', validateId, (req, res, next) => controller.clear(req, res, next));

export default router;
