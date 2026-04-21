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
    private deleteUseCase: DeleteClientUseCase,
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
      const clients = await this.listUseCase.execute(req.user!.id);
      return res.json(clients);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user!.id;
      // reuse the repository directly via list use case's repo — simplest: find from list
      const clients = await this.listUseCase.execute(userId);
      const client = clients.find((c) => c.id === id);
      if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });
      return res.json(client);
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
