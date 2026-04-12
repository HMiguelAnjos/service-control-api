import { Router } from 'express';
import { ProductController } from '../adapters/controllers/product-controller';
import { PrismaProductRepository } from '../infrastructure/db/prisma-product-repository';
import { CreateProductUseCase } from '../application/use-cases/product/create-product-use-case';
import { DeleteProductUseCase } from '../application/use-cases/product/delete-product-use-case';
import { ListProductsUseCase } from '../application/use-cases/product/list-products-use-case';
import { UpdateProductUseCase } from '../application/use-cases/product/update-product-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { createProductSchema, updateProductSchema } from '../middlewares/validation/schemas/product-schemas';

const router = Router();

const repo = new PrismaProductRepository();
const createUseCase = new CreateProductUseCase(repo);
const listUseCase = new ListProductsUseCase(repo);
const updateUseCase = new UpdateProductUseCase(repo);
const deleteUseCase = new DeleteProductUseCase(repo);
const controller = new ProductController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.use(authMiddleware);

router.post('/', validate(createProductSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateProductSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
