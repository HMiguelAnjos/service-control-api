import { Router } from 'express';
import { ServiceController } from '../adapters/controllers/service-controller';
import { PrismaServiceRepository } from '../infrastructure/db/prisma-service-repository';
import { PrismaExpenseRepository } from '../infrastructure/db/prisma-expense-repository';
import { PrismaServiceProductRepository } from '../infrastructure/db/prisma-service-product-repository';
import { PrismaProfitRepository } from '../infrastructure/db/prisma-profit-repository';
import { CreateServiceUseCase } from '../application/use-cases/service/create-service-use-case';
import { DeleteServiceUseCase } from '../application/use-cases/service/delete-service-use-case';
import { ListServicesUseCase } from '../application/use-cases/service/list-services-use-case';
import { UpdateServiceUseCase } from '../application/use-cases/service/update-service-use-case';
import { ListClientServicesUseCase } from '../application/use-cases/service/list-client-services-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { createServiceSchema, updateServiceSchema } from '../middlewares/validation/schemas/service-schemas';

const router = Router();

const repo = new PrismaServiceRepository();
const expenseRepo = new PrismaExpenseRepository();
const serviceProductRepo = new PrismaServiceProductRepository();
const profitRepo = new PrismaProfitRepository();

const createUseCase = new CreateServiceUseCase(repo, profitRepo);
const listUseCase = new ListServicesUseCase(repo);
const updateUseCase = new UpdateServiceUseCase(repo, expenseRepo, profitRepo);
const deleteUseCase = new DeleteServiceUseCase(repo, expenseRepo, serviceProductRepo, profitRepo);
const listClientServicesUseCase = new ListClientServicesUseCase(repo);
const controller = new ServiceController(createUseCase, listUseCase, updateUseCase, deleteUseCase, listClientServicesUseCase);

router.use(authMiddleware);

router.post('/', validate(createServiceSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateServiceSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
