import { NextFunction, Request, Response } from 'express';
import { CreateInventoryUseCase } from '../../application/use-cases/inventory/create-inventory-use-case';
import { ListInventorysUseCase } from '../../application/use-cases/inventory/list-inventorys-use-case';
import { UpdateInventoryUseCase } from '../../application/use-cases/inventory/update-inventory-use-case';
import { DeleteInventoryUseCase } from '../../application/use-cases/inventory/delete-inventory-use-case';

export class InventoryController {
  constructor(
    private createUseCase: CreateInventoryUseCase,
    private listUseCase: ListInventorysUseCase,
    private updateUseCase: UpdateInventoryUseCase,
    private deleteUseCase: DeleteInventoryUseCase
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
      const inventory = await this.listUseCase.execute();
      return res.json(inventory);
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
