import { Router } from 'express';
import { ProfitController } from '../adapters/controllers/profit-controller';

import { PrismaProfitRepository } from '../infrastructure/db/prisma-profit-repository';
import { CreateProfitUseCase } from '../application/use-cases/profit/create-profit-use-case';
import { DeleteProfitUseCase } from '../application/use-cases/profit/delete-profit-use-case';
import { ListProfitsUseCase } from '../application/use-cases/profit/list-profits-use-case';
import { UpdateProfitUseCase } from '../application/use-cases/profit/update-profit-use-case';

const router = Router();

const repo = new PrismaProfitRepository();
const createUseCase = new CreateProfitUseCase(repo);
const listUseCase = new ListProfitsUseCase(repo);
const updateUseCase = new UpdateProfitUseCase(repo);
const deleteUseCase = new DeleteProfitUseCase(repo);
const controller = new ProfitController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
