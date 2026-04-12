import { Router } from 'express';
import { ProcedureTypeController } from '../adapters/controllers/procedure-type-controller';
import { PrismaProcedureTypeRepository } from '../infrastructure/db/prisma-procedure-type-repository';
import { CreateProcedureTypeUseCase } from '../application/use-cases/procedure-type/create-procedure-type-use-case';
import { DeleteProcedureTypeUseCase } from '../application/use-cases/procedure-type/delete-procedure-type-use-case';
import { ListProcedureTypesUseCase } from '../application/use-cases/procedure-type/list-procedure-types-use-case';
import { UpdateProcedureTypeUseCase } from '../application/use-cases/procedure-type/update-procedure-type-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import {
  createProcedureTypeSchema,
  updateProcedureTypeSchema,
} from '../middlewares/validation/schemas/procedure-type-schemas';

const router = Router();

const repo = new PrismaProcedureTypeRepository();
const createUseCase = new CreateProcedureTypeUseCase(repo);
const listUseCase = new ListProcedureTypesUseCase(repo);
const updateUseCase = new UpdateProcedureTypeUseCase(repo);
const deleteUseCase = new DeleteProcedureTypeUseCase(repo);
const controller = new ProcedureTypeController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.use(authMiddleware);

router.post('/', validate(createProcedureTypeSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateProcedureTypeSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
