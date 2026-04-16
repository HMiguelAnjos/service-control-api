import { Router } from 'express';
import { ProcedureTypeProductController } from '../adapters/controllers/procedure-type-product-controller';
import { PrismaProcedureTypeProductRepository } from '../infrastructure/db/prisma-procedure-type-product-repository';
import { PrismaProcedureTypeRepository } from '../infrastructure/db/prisma-procedure-type-repository';
import { UpsertProcedureTypeProductUseCase } from '../application/use-cases/procedure-type-product/upsert-procedure-type-product-use-case';
import { ListProcedureTypeProductsUseCase } from '../application/use-cases/procedure-type-product/list-procedure-type-products-use-case';
import { DeleteProcedureTypeProductUseCase } from '../application/use-cases/procedure-type-product/delete-procedure-type-product-use-case';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validate, validateId } from '../middlewares/validation/validate';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const repo = new PrismaProcedureTypeProductRepository();
const procedureTypeRepo = new PrismaProcedureTypeRepository();

const upsertUseCase = new UpsertProcedureTypeProductUseCase(repo, procedureTypeRepo);
const listUseCase = new ListProcedureTypeProductsUseCase(repo);
const deleteUseCase = new DeleteProcedureTypeProductUseCase(repo, procedureTypeRepo);
const controller = new ProcedureTypeProductController(upsertUseCase, listUseCase, deleteUseCase);

const upsertSchema = z.object({
  productId: z
    .number({ required_error: 'Produto é obrigatório', invalid_type_error: 'productId deve ser um número' })
    .int()
    .positive(),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .positive('Quantidade deve ser maior que zero'),
});

router.use(authMiddleware);

router.post('/', validate(upsertSchema), (req, res, next) => controller.upsert(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
