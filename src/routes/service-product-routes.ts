import { Router } from 'express';
import { ServiceProductController } from '../adapters/controllers/service-product-controller';

import { PrismaServiceProductRepository } from '../infrastructure/db/prisma-service-product-repository';
import { CreateServiceProductUseCase } from '../application/use-cases/service-product/create-service-product-use-case';
import { DeleteServiceProductUseCase } from '../application/use-cases/service-product/delete-service-product-use-case';
import { ListServiceProductsUseCase } from '../application/use-cases/service-product/list-service-products-use-case';
import { UpdateServiceProductUseCase } from '../application/use-cases/service-product/update-service-product-use-case';

const router = Router();

const repo = new PrismaServiceProductRepository();
const createUseCase = new CreateServiceProductUseCase(repo);
const listUseCase = new ListServiceProductsUseCase(repo);
const updateUseCase = new UpdateServiceProductUseCase(repo);
const deleteUseCase = new DeleteServiceProductUseCase(repo);
const controller = new ServiceProductController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
