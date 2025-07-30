import { Router } from 'express';
import { ServiceController } from '../adapters/controllers/service-controller';

import { PrismaServiceRepository } from '../infrastructure/db/prisma-service-repository';
import { CreateServiceUseCase } from '../application/use-cases/service/create-service-use-case';
import { DeleteServiceUseCase } from '../application/use-cases/service/delete-service-use-case';
import { ListServiceUseCase } from '../application/use-cases/service/list-services-use-case';
import { UpdateServiceUseCase } from '../application/use-cases/service/update-service-use-case';

const router = Router();

const repo = new PrismaServiceRepository();
const createUseCase = new CreateServiceUseCase(repo);
const listUseCase = new ListServiceUseCase(repo);
const updateUseCase = new UpdateServiceUseCase(repo);
const deleteUseCase = new DeleteServiceUseCase(repo);
const controller = new ServiceController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
