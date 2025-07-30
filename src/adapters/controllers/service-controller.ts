import { NextFunction, Request, Response } from 'express';
import { CreateServiceUseCase } from '../../application/use-cases/service/create-service-use-case';
import { ListServicesUseCase } from '../../application/use-cases/service/list-services-use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/service/update-service-use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/service/delete-service-use-case';

export class ServiceController {
  constructor(
    private createUseCase: CreateServiceUseCase,
    private listUseCase: ListServicesUseCase,
    private updateUseCase: UpdateServiceUseCase,
    private deleteUseCase: DeleteServiceUseCase
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
      const services = await this.listUseCase.execute();
      return res.json(services);
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
