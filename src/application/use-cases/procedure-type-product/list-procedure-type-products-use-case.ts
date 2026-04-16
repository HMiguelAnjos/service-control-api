import { ProcedureTypeProduct } from '../../../domain/entities/procedure-type-product';
import { IProcedureTypeProductRepository } from '../../ports/iprocedure-type-product-repository';

export class ListProcedureTypeProductsUseCase {
  constructor(
    private repo: IProcedureTypeProductRepository,
  ) {}

  async execute(procedureTypeId: number, userId: number): Promise<ProcedureTypeProduct[]> {
    return this.repo.findByProcedureType(procedureTypeId, userId);
  }
}
