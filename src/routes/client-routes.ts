import { Router } from 'express';
import { ClientController } from '../adapters/controllers/client-controller';

import { PrismaClientRepository } from '../infrastructure/db/prisma-client-repository';
import { CreateClientUseCase } from '../application/use-cases/client/create-client-use-case';
import { DeleteClientUseCase } from '../application/use-cases/client/delete-client-use-case';
import { ListClientsUseCase } from '../application/use-cases/client/list-clients-use-case';
import { UpdateClientUseCase } from '../application/use-cases/client/update-client-use-case';

const router = Router();

const repo = new PrismaClientRepository();
const createUseCase = new CreateClientUseCase(repo);
const listUseCase = new ListClientsUseCase(repo);
const updateUseCase = new UpdateClientUseCase(repo);
const deleteUseCase = new DeleteClientUseCase(repo);
const controller = new ClientController(createUseCase, listUseCase, updateUseCase, deleteUseCase);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

export default router;
