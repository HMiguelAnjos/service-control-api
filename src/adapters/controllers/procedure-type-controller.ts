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
    private deleteUseCase: DeleteProcedureTypeUseCase,
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
      const procedures = await this.listUseCase.execute(req.user!.id);
      return res.json(procedures);
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
