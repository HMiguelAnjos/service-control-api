import { IProcedureTypeProductRepository } from '../../ports/iprocedure-type-product-repository';
import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';
import { ProcedureType } from '../../../domain/entities/procedure-type';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class DeleteProcedureTypeProductUseCase {
  constructor(
    private repo: IProcedureTypeProductRepository,
    private procedureTypeRepo: IProcedureTypeRepository,
  ) {}

  async execute(id: number, procedureTypeId: number, userId: number) {
    const procedureType = await this.procedureTypeRepo.findOne(procedureTypeId, userId);
    if (!procedureType) {
      throw new BadRequest(404, 'Tipo de procedimento não encontrado');
    }

    await this.repo.delete(id, userId);

    // Recalculate costValue after removal
    const products = await this.repo.findByProcedureType(procedureTypeId, userId);
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
