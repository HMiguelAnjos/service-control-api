import { NextFunction, Request, Response } from 'express';
import { UpsertProcedureTypeProductUseCase } from '../../application/use-cases/procedure-type-product/upsert-procedure-type-product-use-case';
import { ListProcedureTypeProductsUseCase } from '../../application/use-cases/procedure-type-product/list-procedure-type-products-use-case';
import { DeleteProcedureTypeProductUseCase } from '../../application/use-cases/procedure-type-product/delete-procedure-type-product-use-case';

export class ProcedureTypeProductController {
  constructor(
    private upsertUseCase: UpsertProcedureTypeProductUseCase,
    private listUseCase: ListProcedureTypeProductsUseCase,
    private deleteUseCase: DeleteProcedureTypeProductUseCase,
  ) {}

  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const procedureTypeId = Number(req.params.procedureTypeId);
      const userId = req.user!.id;
      await this.upsertUseCase.execute({ ...req.body, procedureTypeId, userId });
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const procedureTypeId = Number(req.params.procedureTypeId);
      const userId = req.user!.id;
      const items = await this.listUseCase.execute(procedureTypeId, userId);
      return res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const procedureTypeId = Number(req.params.procedureTypeId);
      const userId = req.user!.id;
      await this.deleteUseCase.execute(id, procedureTypeId, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
