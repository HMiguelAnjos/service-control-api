import { NextFunction, Request, Response } from 'express';
import { CreateExpenseUseCase } from '../../application/use-cases/expense/create-expense-use-case';
import { ListExpensesUseCase } from '../../application/use-cases/expense/list-expenses-use-case';
import { UpdateExpenseUseCase } from '../../application/use-cases/expense/update-expense-use-case';
import { DeleteExpenseUseCase } from '../../application/use-cases/expense/delete-expense-use-case';
import { isPaginatedRequest, parsePagination } from '../../application/utils/pagination';

export class ExpenseController {
  constructor(
    private createUseCase: CreateExpenseUseCase,
    private listUseCase: ListExpensesUseCase,
    private updateUseCase: UpdateExpenseUseCase,
    private deleteUseCase: DeleteExpenseUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await this.createUseCase.execute({ ...req.body, userId });
      return res.status(201).send();
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      if (isPaginatedRequest(req.query)) {
        const page = await this.listUseCase.executePaginated(
          userId,
          parsePagination(req.query),
        );
        return res.json(page);
      }
      const expenses = await this.listUseCase.execute(userId);
      return res.json(expenses);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user!.id;
      await this.updateUseCase.execute({ ...req.body, id, userId });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.deleteUseCase.execute(Number(req.params.id), req.user!.id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
