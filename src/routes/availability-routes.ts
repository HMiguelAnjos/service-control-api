import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';
import { validateId } from '../middlewares/validation/validate';

import { PrismaAvailabilityRepository } from '../infrastructure/db/prisma-availability-repository';
import { PrismaBlockedTimeRepository } from '../infrastructure/db/prisma-blocked-time-repository';

import { GetAvailabilityRulesUseCase } from '../application/use-cases/availability/get-availability-rules-use-case';
import { ReplaceAvailabilityRulesUseCase } from '../application/use-cases/availability/replace-availability-rules-use-case';
import { CreateBlockedTimeUseCase } from '../application/use-cases/blocked-time/create-blocked-time-use-case';
import { ListBlockedTimesUseCase } from '../application/use-cases/blocked-time/list-blocked-times-use-case';
import { DeleteBlockedTimeUseCase } from '../application/use-cases/blocked-time/delete-blocked-time-use-case';

import { AvailabilityController } from '../adapters/controllers/availability-controller';

const router = Router();

const availabilityRepo = new PrismaAvailabilityRepository();
const blockedRepo = new PrismaBlockedTimeRepository();

const controller = new AvailabilityController(
  new GetAvailabilityRulesUseCase(availabilityRepo),
  new ReplaceAvailabilityRulesUseCase(availabilityRepo),
  new CreateBlockedTimeUseCase(blockedRepo),
  new ListBlockedTimesUseCase(blockedRepo),
  new DeleteBlockedTimeUseCase(blockedRepo),
);

router.use(authMiddleware);
router.use(requirePlanFeature('agenda'));

// Horário de funcionamento
router.get('/rules', (req, res, next) => controller.getAll(req, res, next));
router.put('/rules', (req, res, next) => controller.replaceAll(req, res, next));

// Bloqueios
router.get('/blocks', (req, res, next) => controller.listBlocks(req, res, next));
router.post('/blocks', (req, res, next) => controller.createBlock(req, res, next));
router.delete('/blocks/:id', validateId, (req, res, next) => controller.deleteBlock(req, res, next));

export default router;
