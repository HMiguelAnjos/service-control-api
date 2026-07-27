import { Router } from 'express';
import { ProcedureTypeController } from '../adapters/controllers/procedure-type-controller';
import { PrismaProcedureTypeRepository } from '../infrastructure/db/prisma-procedure-type-repository';
import { PrismaFixedCostRepository } from '../infrastructure/db/prisma-fixed-cost-repository';
import { PrismaProfessionalRepository } from '../infrastructure/db/prisma-professional-repository';
import { PrismaPaymentMethodRepository } from '../infrastructure/db/prisma-payment-method-repository';
import { CreateProcedureTypeUseCase } from '../application/use-cases/procedure-type/create-procedure-type-use-case';
import { DeleteProcedureTypeUseCase } from '../application/use-cases/procedure-type/delete-procedure-type-use-case';
import { ListProcedureTypesUseCase } from '../application/use-cases/procedure-type/list-procedure-types-use-case';
import { UpdateProcedureTypeUseCase } from '../application/use-cases/procedure-type/update-procedure-type-use-case';
import { ReversePriceUseCase } from '../application/use-cases/procedure-type/reverse-price-use-case';
import { RateioCalculator } from '../application/services/rateio-calculator';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { ForbiddenError, ValidationError } from '../middlewares/errors/errors';
import {
  createProcedureTypeSchema,
  updateProcedureTypeSchema,
} from '../middlewares/validation/schemas/procedure-type-schemas';

const router = Router();

const repo = new PrismaProcedureTypeRepository();
const fixedCostRepo = new PrismaFixedCostRepository();
const professionalRepo = new PrismaProfessionalRepository();
const paymentMethodRepo = new PrismaPaymentMethodRepository();

const createUseCase = new CreateProcedureTypeUseCase(repo);
const listUseCase = new ListProcedureTypesUseCase(repo);
const updateUseCase = new UpdateProcedureTypeUseCase(repo);
const deleteUseCase = new DeleteProcedureTypeUseCase(repo);
const controller = new ProcedureTypeController(
  createUseCase,
  listUseCase,
  updateUseCase,
  deleteUseCase,
);

const rateio = new RateioCalculator(fixedCostRepo);
const reversePriceUseCase = new ReversePriceUseCase(rateio, professionalRepo, paymentMethodRepo);

router.use(authMiddleware);

router.post('/', validate(createProcedureTypeSchema), (req, res, next) =>
  controller.create(req, res, next),
);
router.get('/', (req, res, next) => controller.list(req, res, next));
router.put('/:id', validateId, validate(updateProcedureTypeSchema), (req, res, next) =>
  controller.update(req, res, next),
);
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

router.post('/:id/reverse-price', validateId, async (req, res, next) => {
  try {
    const businessId = req.user?.businessId;
    if (!businessId) {
      throw new ForbiddenError(
        'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
      );
    }
    const body = req.body ?? {};
    const desiredMarginPct = Number(body.desiredMarginPct);
    const paymentMethodId = Number(body.paymentMethodId);
    if (!Number.isFinite(desiredMarginPct))
      throw new ValidationError('desiredMarginPct obrigatório.');
    if (!Number.isFinite(paymentMethodId) || paymentMethodId <= 0) {
      throw new ValidationError('paymentMethodId obrigatório.');
    }
    const result = await reversePriceUseCase.execute({
      businessId,
      procedureTypeId: Number(req.params.id),
      desiredMarginPct,
      paymentMethodId,
      professionalId: body.professionalId != null ? Number(body.professionalId) : null,
      durationMinutes: body.durationMinutes != null ? Number(body.durationMinutes) : null,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
