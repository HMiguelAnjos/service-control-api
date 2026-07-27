import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validateId } from '../middlewares/validation/validate';

import { PrismaPaymentMethodRepository } from '../infrastructure/db/prisma-payment-method-repository';
import { CreatePaymentMethodUseCase } from '../application/use-cases/payment-method/create-payment-method-use-case';
import { UpdatePaymentMethodUseCase } from '../application/use-cases/payment-method/update-payment-method-use-case';
import { ListPaymentMethodsUseCase } from '../application/use-cases/payment-method/list-payment-methods-use-case';
import { DeletePaymentMethodUseCase } from '../application/use-cases/payment-method/delete-payment-method-use-case';
import { PaymentMethodController } from '../adapters/controllers/payment-method-controller';

const router = Router();

const repo = new PrismaPaymentMethodRepository();
const controller = new PaymentMethodController(
  new CreatePaymentMethodUseCase(repo),
  new UpdatePaymentMethodUseCase(repo),
  new ListPaymentMethodsUseCase(repo),
  new DeletePaymentMethodUseCase(repo),
);

router.use(authMiddleware);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.patch('/:id', validateId, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
