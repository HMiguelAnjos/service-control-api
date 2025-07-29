import { NextFunction, Request, Response } from 'express';
import { CreateServiceProductUseCase } from '../../application/use-cases/service-product/create-service-product-use-case';
import { ListServiceProductsUseCase } from '../../application/use-cases/service-product/list-service-products-use-case';
import { UpdateServiceProductUseCase } from '../../application/use-cases/service-product/update-service-product-use-case';
import { DeleteServiceProductUseCase } from '../../application/use-cases/service-product/delete-service-product-use-case';

export class ServiceProductController {
  constructor(
    private createUseCase: CreateServiceProductUseCase,
    private listUseCase: ListServiceProductsUseCase,
    private updateUseCase: UpdateServiceProductUseCase,
    private deleteUseCase: DeleteServiceProductUseCase
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
      const serviceProducts = await this.listUseCase.execute();
      return res.json(serviceProducts);
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
