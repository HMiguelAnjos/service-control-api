import { Router } from 'express';
import { ClientController } from '../adapters/controllers/client-controller';
import { PrismaClientRepository } from '../infrastructure/db/prisma-client-repository';
import { PrismaServiceRepository } from '../infrastructure/db/prisma-service-repository';
import { CreateClientUseCase } from '../application/use-cases/client/create-client-use-case';
import { DeleteClientUseCase } from '../application/use-cases/client/delete-client-use-case';
import { ListClientsUseCase } from '../application/use-cases/client/list-clients-use-case';
import { UpdateClientUseCase } from '../application/use-cases/client/update-client-use-case';
import { ListClientServicesUseCase } from '../application/use-cases/service/list-client-services-use-case';
import { ListMissingClientsUseCase } from '../application/use-cases/client/list-missing-clients-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { ForbiddenError } from '../middlewares/errors/errors';
import { validate, validateId } from '../middlewares/validation/validate';
import {
  createClientSchema,
  updateClientSchema,
} from '../middlewares/validation/schemas/client-schemas';

const router = Router();

const repo = new PrismaClientRepository();
const serviceRepo = new PrismaServiceRepository();

const createUseCase = new CreateClientUseCase(repo);
const listUseCase = new ListClientsUseCase(repo);
const updateUseCase = new UpdateClientUseCase(repo);
const deleteUseCase = new DeleteClientUseCase(repo);
const controller = new ClientController(
  createUseCase,
  listUseCase,
  updateUseCase,
  deleteUseCase,
  repo,
);

const listClientServicesUseCase = new ListClientServicesUseCase(serviceRepo);
const listMissingClientsUseCase = new ListMissingClientsUseCase();

router.use(authMiddleware);

router.post('/', validate(createClientSchema), (req, res, next) =>
  controller.create(req, res, next),
);
router.get('/', (req, res, next) => controller.list(req, res, next));

// Missing clients (rule 11).  Route sits before /:id so "missing" is not
// parsed as a client id.
router.get('/missing', async (req, res, next) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      throw new ForbiddenError(
        'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
      );
    }
    const overrideDaysOverdue = req.query.daysOverdue ? Number(req.query.daysOverdue) : undefined;
    const items = await listMissingClientsUseCase.execute({
      businessId,
      overrideDaysOverdue: Number.isFinite(overrideDaysOverdue) ? overrideDaysOverdue : undefined,
    });
    return res.json(items);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', validateId, (req, res, next) => controller.getOne(req, res, next));
router.get('/:id/services', validateId, async (req, res, next) => {
  try {
    const services = await listClientServicesUseCase.execute(Number(req.params.id), req.user!.id);
    return res.json(services);
  } catch (error) {
    next(error);
  }
});
router.put('/:id', validateId, validate(updateClientSchema), (req, res, next) =>
  controller.update(req, res, next),
);
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
