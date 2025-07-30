import { Router } from 'express';
import { InventoryController } from '../adapters/controllers/inventory-controller';

import { PrismaInventoryRepository } from '../infrastructure/db/prisma-inventory-repository';
import { CreateInventoryUseCase } from '../application/use-cases/inventory/create-inventory-use-case';
import { DeleteInventoryUseCase } from '../application/use-cases/inventory/delete-inventory-use-case';
import { ListInventorysUseCase } from '../application/use-cases/inventory/list-inventorys-use-case';
import { UpdateInventoryUseCase } from '../application/use-cases/inventory/update-inventory-use-case';

const router = Router();

const repo = new PrismaInventoryRepository();
const createUseCase = new CreateInventoryUseCase(repo);
const listUseCase = new ListInventorysUseCase(repo);
const updateUseCase = new UpdateInventoryUseCase(repo);
const deleteUseCase = new DeleteInventoryUseCase(repo);
const controller = new InventoryController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
