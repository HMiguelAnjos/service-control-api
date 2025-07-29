import { NextFunction, Request, Response } from 'express';
import { CreateProcedureTypeUseCase } from '../../application/use-cases/procedure-type/create-procedure-type-use-case';
import { ListProcedureTypesUseCase } from '../../application/use-cases/procedure-type/list-procedure-types-use-case';
import { UpdateProcedureTypeUseCase } from '../../application/use-cases/procedure-type/update-procedure-type-use-case';
import { DeleteProcedureTypeUseCase } from '../../application/use-cases/procedure-type/delete-procedure-type-use-case';

export class ProcedureTypeController {
  constructor(
    private createUseCase: CreateProcedureTypeUseCase,
    private listUseCase: ListProcedureTypesUseCase,
    private updateUseCase: UpdateProcedureTypeUseCase,
    private deleteUseCase: DeleteProcedureTypeUseCase
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
      const procedures = await this.listUseCase.execute();
      return res.json(procedures);
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
      await this.deleteUseCase.execute(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }
}
