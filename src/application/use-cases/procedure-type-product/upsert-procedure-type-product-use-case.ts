import { ProcedureTypeProduct } from '../../../domain/entities/procedure-type-product';
import { IProcedureTypeProductRepository } from '../../ports/iprocedure-type-product-repository';
import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';
import { ProcedureType } from '../../../domain/entities/procedure-type';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export class UpsertProcedureTypeProductUseCase {
  constructor(
    private repo: IProcedureTypeProductRepository,
    private procedureTypeRepo: IProcedureTypeRepository,
  ) {}

  async execute(input: {
    procedureTypeId: number;
    productId: number;
    quantity: number;
    userId: number;
  }) {
    const procedureType = await this.procedureTypeRepo.findOne(input.procedureTypeId, input.userId);
    if (!procedureType) {
      throw new NotFoundError('Tipo de procedimento');
    }

    const item = new ProcedureTypeProduct(undefined, input.procedureTypeId, input.productId, input.quantity);
    if (!item.isValid()) {
      throw new ValidationError('Dados inválidos');
    }

    await this.repo.upsert(item);

    // Recalculate costValue for the procedure type
    const products = await this.repo.findByProcedureType(input.procedureTypeId, input.userId);
    const costValue = products.reduce((sum, p) => sum + (p.unitCost ?? 0) * p.quantity, 0);

    const updated = new ProcedureType(
      procedureType.id,
      procedureType.userId,
      procedureType.name,
      procedureType.description,
      costValue,
      procedureType.finalValue,
    );
    await this.procedureTypeRepo.update(updated);
  }
}
