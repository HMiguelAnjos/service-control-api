import { Router } from 'express';
import { ServiceController } from '../adapters/controllers/service-controller';
import { ServiceDraftController } from '../adapters/controllers/service-draft-controller';
import { PrismaServiceRepository } from '../infrastructure/db/prisma-service-repository';
import { PrismaExpenseRepository } from '../infrastructure/db/prisma-expense-repository';
import { PrismaInventoryRepository } from '../infrastructure/db/prisma-inventory-repository';
import { PrismaProcedureTypeProductRepository } from '../infrastructure/db/prisma-procedure-type-product-repository';
import { PrismaProfessionalRepository } from '../infrastructure/db/prisma-professional-repository';
import { PrismaPaymentMethodRepository } from '../infrastructure/db/prisma-payment-method-repository';
import { PrismaFixedCostRepository } from '../infrastructure/db/prisma-fixed-cost-repository';
import { CreateServiceUseCase } from '../application/use-cases/service/create-service-use-case';
import { CreateDraftServiceUseCase } from '../application/use-cases/service/create-draft-service-use-case';
import { ConfirmServiceUseCase } from '../application/use-cases/service/confirm-service-use-case';
import { DeleteServiceUseCase } from '../application/use-cases/service/delete-service-use-case';
import { ListServicesUseCase } from '../application/use-cases/service/list-services-use-case';
import { UpdateServiceUseCase } from '../application/use-cases/service/update-service-use-case';
import { ListClientServicesUseCase } from '../application/use-cases/service/list-client-services-use-case';
import { RateioCalculator } from '../application/services/rateio-calculator';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import {
  createServiceSchema,
  updateServiceSchema,
} from '../middlewares/validation/schemas/service-schemas';

const router = Router();

const repo = new PrismaServiceRepository();
const expenseRepo = new PrismaExpenseRepository();
const inventoryRepo = new PrismaInventoryRepository();
const procedureTypeProductRepo = new PrismaProcedureTypeProductRepository();
const professionalRepo = new PrismaProfessionalRepository();
const paymentMethodRepo = new PrismaPaymentMethodRepository();
const fixedCostRepo = new PrismaFixedCostRepository();

const createUseCase = new CreateServiceUseCase(
  repo,
  expenseRepo,
  inventoryRepo,
  procedureTypeProductRepo,
);
const listUseCase = new ListServicesUseCase(repo);
const updateUseCase = new UpdateServiceUseCase(repo);
const deleteUseCase = new DeleteServiceUseCase(repo, expenseRepo);
const listClientServicesUseCase = new ListClientServicesUseCase(repo);
const controller = new ServiceController(
  createUseCase,
  listUseCase,
  updateUseCase,
  deleteUseCase,
  listClientServicesUseCase,
);

const rateio = new RateioCalculator(fixedCostRepo);
const draftUseCase = new CreateDraftServiceUseCase();
const confirmUseCase = new ConfirmServiceUseCase(professionalRepo, paymentMethodRepo, rateio);
const draftController = new ServiceDraftController(draftUseCase, confirmUseCase);

router.use(authMiddleware);

// Draft/confirm flow (Phase 3 — snapshot-based)
router.post('/draft', (req, res, next) => draftController.draft(req, res, next));
router.post('/:id/confirm', validateId, (req, res, next) =>
  draftController.confirm(req, res, next),
);

// Legacy (one-shot) endpoints — snapshot stays null.
router.post('/', validate(createServiceSchema), (req, res, next) =>
  controller.create(req, res, next),
);
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateServiceSchema), (req, res, next) =>
  controller.update(req, res, next),
);
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
