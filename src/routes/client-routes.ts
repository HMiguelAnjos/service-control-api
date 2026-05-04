import { Router } from 'express';
import { ClientController } from '../adapters/controllers/client-controller';
import { PrismaClientRepository } from '../infrastructure/db/prisma-client-repository';
import { PrismaServiceRepository } from '../infrastructure/db/prisma-service-repository';
import { CreateClientUseCase } from '../application/use-cases/client/create-client-use-case';
import { DeleteClientUseCase } from '../application/use-cases/client/delete-client-use-case';
import { ListClientsUseCase } from '../application/use-cases/client/list-clients-use-case';
import { UpdateClientUseCase } from '../application/use-cases/client/update-client-use-case';
import { ListClientServicesUseCase } from '../application/use-cases/service/list-client-services-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { createClientSchema, updateClientSchema } from '../middlewares/validation/schemas/client-schemas';

const router = Router();

const repo = new PrismaClientRepository();
const serviceRepo = new PrismaServiceRepository();

const createUseCase = new CreateClientUseCase(repo);
const listUseCase = new ListClientsUseCase(repo);
const updateUseCase = new UpdateClientUseCase(repo);
const deleteUseCase = new DeleteClientUseCase(repo);
const controller = new ClientController(createUseCase, listUseCase, updateUseCase, deleteUseCase, repo);

const listClientServicesUseCase = new ListClientServicesUseCase(serviceRepo);

router.use(authMiddleware);

router.post('/', validate(createClientSchema), (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.get('/:id', validateId, (req, res, next) => controller.getOne(req, res, next));
router.get('/:id/services', validateId, async (req, res, next) => {
  try {
    const services = await listClientServicesUseCase.execute(Number(req.params.id), req.user!.id);
    return res.json(services);
  } catch (error) {
    next(error);
  }
});
router.put('/:id', validateId, validate(updateClientSchema), (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
