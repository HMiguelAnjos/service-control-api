import { Router } from 'express';
import { ExpenseController } from '../adapters/controllers/expense-controller';

import { PrismaExpenseRepository } from '../infrastructure/db/prisma-expense-repository';
import { CreateExpenseUseCase } from '../application/use-cases/create-expense-use-case';
import { ListExpensesUseCase } from '../application/use-cases/list-expenses-use-case';
import { UpdateExpenseUseCase } from '../application/use-cases/update-expense-use-case';
import { DeleteExpenseUseCase } from '../application/use-cases/delete-expense-use-case';

const router = Router();

const repo = new PrismaExpenseRepository();
const createUseCase = new CreateExpenseUseCase(repo);
const listUseCase = new ListExpensesUseCase(repo);
const updateUseCase = new UpdateExpenseUseCase(repo);
const deleteUseCase = new DeleteExpenseUseCase(repo);
const controller = new ExpenseController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
