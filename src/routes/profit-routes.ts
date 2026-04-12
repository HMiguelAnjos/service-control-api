import { Router } from 'express';
import { ProfitController } from '../adapters/controllers/profit-controller';
import { PrismaProfitRepository } from '../infrastructure/db/prisma-profit-repository';
import { CreateProfitUseCase } from '../application/use-cases/profit/create-profit-use-case';
import { DeleteProfitUseCase } from '../application/use-cases/profit/delete-profit-use-case';
import { ListProfitsUseCase } from '../application/use-cases/profit/list-profits-use-case';
import { UpdateProfitUseCase } from '../application/use-cases/profit/update-profit-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { createProfitSchema, updateProfitSchema } from '../middlewares/validation/schemas/profit-schemas';

const router = Router();

const repo = new PrismaProfitRepository();
const createUseCase = new CreateProfitUseCase(repo);
const listUseCase = new ListProfitsUseCase(repo);
const updateUseCase = new UpdateProfitUseCase(repo);
const deleteUseCase = new DeleteProfitUseCase(repo);
const controller = new ProfitController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.use(authMiddleware);

router.post('/', validate(createProfitSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateProfitSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
