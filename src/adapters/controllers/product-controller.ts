import { NextFunction, Request, Response } from 'express';
import { CreateProductUseCase } from '../../application/use-cases/product/create-product-use-case';
import { ListProductsUseCase } from '../../application/use-cases/product/list-products-use-case';
import { UpdateProductUseCase } from '../../application/use-cases/product/update-product-use-case';
import { DeleteProductUseCase } from '../../application/use-cases/product/delete-product-use-case';

export class ProductController {
  constructor(
    private createUseCase: CreateProductUseCase,
    private listUseCase: ListProductsUseCase,
    private updateUseCase: UpdateProductUseCase,
    private deleteUseCase: DeleteProductUseCase,
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
      const products = await this.listUseCase.execute(req.user!.id);
      return res.json(products);
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
