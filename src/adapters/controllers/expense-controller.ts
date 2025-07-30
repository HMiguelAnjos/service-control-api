import { NextFunction, Request, Response } from 'express';
import { CreateExpenseUseCase } from '../../application/use-cases/expense/create-expense-use-case';
import { ListExpensesUseCase } from '../../application/use-cases/expense/list-expenses-use-case';
import { UpdateExpenseUseCase } from '../../application/use-cases/expense/update-expense-use-case';
import { DeleteExpenseUseCase } from '../../application/use-cases/expense/delete-expense-use-case';

export class ExpenseController {
  constructor(
    private createUseCase: CreateExpenseUseCase,
    private listUseCase: ListExpensesUseCase,
    private updateUseCase: UpdateExpenseUseCase,
    private deleteUseCase: DeleteExpenseUseCase
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      await this.createUseCase.execute(req.body);
      return res.status(201).send();
    } catch (error: any) {
      next(error);
    }
  }

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await this.listUseCase.execute();
      return res.json(expenses);
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const data = { ...req.body, id };
      await this.updateUseCase.execute(data);
      return res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(Number(req.params.id));
      return res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}
