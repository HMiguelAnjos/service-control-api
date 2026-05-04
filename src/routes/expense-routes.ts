import { Router } from 'express';
import { ExpenseController } from '../adapters/controllers/expense-controller';
import { PrismaExpenseRepository } from '../infrastructure/db/prisma-expense-repository';
import { CreateExpenseUseCase } from '../application/use-cases/expense/create-expense-use-case';
import { DeleteExpenseUseCase } from '../application/use-cases/expense/delete-expense-use-case';
import { ListExpensesUseCase } from '../application/use-cases/expense/list-expenses-use-case';
import { UpdateExpenseUseCase } from '../application/use-cases/expense/update-expense-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { createExpenseSchema, updateExpenseSchema } from '../middlewares/validation/schemas/expense-schemas';

const router = Router();

const repo = new PrismaExpenseRepository();

const createUseCase = new CreateExpenseUseCase(repo);
const listUseCase = new ListExpensesUseCase(repo);
const updateUseCase = new UpdateExpenseUseCase(repo);
const deleteUseCase = new DeleteExpenseUseCase(repo);
const controller = new ExpenseController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.use(authMiddleware);
router.use(requirePlanFeature('expenses'));

router.post('/', validate(createExpenseSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateExpenseSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
