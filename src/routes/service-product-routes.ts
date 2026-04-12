import { Router } from 'express';
import { ServiceProductController } from '../adapters/controllers/service-product-controller';
import { PrismaServiceProductRepository } from '../infrastructure/db/prisma-service-product-repository';
import { CreateServiceProductUseCase } from '../application/use-cases/service-product/create-service-product-use-case';
import { DeleteServiceProductUseCase } from '../application/use-cases/service-product/delete-service-product-use-case';
import { ListServiceProductsUseCase } from '../application/use-cases/service-product/list-service-products-use-case';
import { UpdateServiceProductUseCase } from '../application/use-cases/service-product/update-service-product-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import {
  createServiceProductSchema,
  updateServiceProductSchema,
} from '../middlewares/validation/schemas/service-product-schemas';

const router = Router();

const repo = new PrismaServiceProductRepository();
const createUseCase = new CreateServiceProductUseCase(repo);
const listUseCase = new ListServiceProductsUseCase(repo);
const updateUseCase = new UpdateServiceProductUseCase(repo);
const deleteUseCase = new DeleteServiceProductUseCase(repo);
const controller = new ServiceProductController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.use(authMiddleware);

router.post('/', validate(createServiceProductSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateServiceProductSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
