import { NextFunction, Request, Response } from 'express';
import { CreateProfitUseCase } from '../../application/use-cases/profit/create-profit-use-case';
import { ListProfitsUseCase } from '../../application/use-cases/profit/list-profits-use-case';
import { UpdateProfitUseCase } from '../../application/use-cases/profit/update-profit-use-case';
import { DeleteProfitUseCase } from '../../application/use-cases/profit/delete-profit-use-case';

export class ProfitController {
  constructor(
    private createUseCase: CreateProfitUseCase,
    private listUseCase: ListProfitsUseCase,
    private updateUseCase: UpdateProfitUseCase,
    private deleteUseCase: DeleteProfitUseCase
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
      const profits = await this.listUseCase.execute();
      return res.json(profits);
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      await this.updateUseCase.execute({ ...req.body, id });
      return res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.deleteUseCase.execute(Number(req.params.id));
      return res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}
