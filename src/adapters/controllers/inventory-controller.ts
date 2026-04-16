import { NextFunction, Request, Response } from 'express';
import { CreateInventoryUseCase } from '../../application/use-cases/inventory/create-inventory-use-case';
import { ListInventorysUseCase } from '../../application/use-cases/inventory/list-inventorys-use-case';
import { UpdateInventoryUseCase } from '../../application/use-cases/inventory/update-inventory-use-case';
import { DeleteInventoryUseCase } from '../../application/use-cases/inventory/delete-inventory-use-case';
import { IInventoryRepository } from '../../application/ports/iinventory-repository';

export class InventoryController {
  constructor(
    private createUseCase: CreateInventoryUseCase,
    private listUseCase: ListInventorysUseCase,
    private updateUseCase: UpdateInventoryUseCase,
    private deleteUseCase: DeleteInventoryUseCase,
    private repo: IInventoryRepository,
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
      const inventory = await this.listUseCase.execute(req.user!.id);
      return res.json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user!.id;

      // Busca o registro existente para preservar o productId
      const existing = await this.repo.findOne(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Registro de estoque não encontrado' });
      }

      await this.updateUseCase.execute({
        id,
        userId,
        productId: existing.productId,
        quantity: req.body.quantity,
        purchasePrice: req.body.purchasePrice,
      });
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
