import { NextFunction, Request, Response } from 'express';
import { CreateClientUseCase } from '../../application/use-cases/client/create-client-use-case';
import { ListClientsUseCase } from '../../application/use-cases/client/list-clients-use-case';
import { UpdateClientUseCase } from '../../application/use-cases/client/update-client-use-case';
import { DeleteClientUseCase } from '../../application/use-cases/client/delete-client-use-case';

export class ClientController {
  constructor(
    private createUseCase: CreateClientUseCase,
    private listUseCase: ListClientsUseCase,
    private updateUseCase: UpdateClientUseCase,
    private deleteUseCase: DeleteClientUseCase
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
      const clients = await this.listUseCase.execute();
      return res.json(clients);
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
