import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validateId } from '../middlewares/validation/validate';

import { PrismaProfessionalRepository } from '../infrastructure/db/prisma-professional-repository';
import { CreateProfessionalUseCase } from '../application/use-cases/professional/create-professional-use-case';
import { UpdateProfessionalUseCase } from '../application/use-cases/professional/update-professional-use-case';
import { ListProfessionalsUseCase } from '../application/use-cases/professional/list-professionals-use-case';
import { DeleteProfessionalUseCase } from '../application/use-cases/professional/delete-professional-use-case';
import { SetCommissionPercentUseCase } from '../application/use-cases/professional/set-commission-percent-use-case';
import { ListCommissionRulesUseCase } from '../application/use-cases/professional/list-commission-rules-use-case';
import { ProfessionalController } from '../adapters/controllers/professional-controller';

const router = Router();

const repo = new PrismaProfessionalRepository();
const controller = new ProfessionalController(
  new CreateProfessionalUseCase(repo),
  new UpdateProfessionalUseCase(repo),
  new ListProfessionalsUseCase(repo),
  new DeleteProfessionalUseCase(repo),
  new SetCommissionPercentUseCase(repo),
  new ListCommissionRulesUseCase(repo),
);

router.use(authMiddleware);

router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.patch('/:id', validateId, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

// Commission rules — versionadas, aplicadas sobre lucro (regra 10).
router.get('/:id/commission-rules', validateId, (req, res, next) =>
  controller.listCommissionRules(req, res, next),
);
router.post('/:id/commission', validateId, (req, res, next) =>
  controller.setCommission(req, res, next),
);

export default router;
