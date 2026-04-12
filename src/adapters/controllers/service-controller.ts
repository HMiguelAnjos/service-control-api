import { NextFunction, Request, Response } from 'express';
import { CreateServiceUseCase } from '../../application/use-cases/service/create-service-use-case';
import { ListServicesUseCase } from '../../application/use-cases/service/list-services-use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/service/update-service-use-case';
import { DeleteServiceUseCase } from '../../application/use-cases/service/delete-service-use-case';
import { ListClientServicesUseCase } from '../../application/use-cases/service/list-client-services-use-case';

export class ServiceController {
  constructor(
    private createUseCase: CreateServiceUseCase,
    private listUseCase: ListServicesUseCase,
    private updateUseCase: UpdateServiceUseCase,
    private deleteUseCase: DeleteServiceUseCase,
    private listClientServicesUseCase: ListClientServicesUseCase,
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
      const services = await this.listUseCase.execute(req.user!.id);
      return res.json(services);
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

  async listByClient(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = Number(req.params.id);
      const services = await this.listClientServicesUseCase.execute(clientId, req.user!.id);
      return res.json(services);
    } catch (error) {
      next(error);
    }
  }
}
