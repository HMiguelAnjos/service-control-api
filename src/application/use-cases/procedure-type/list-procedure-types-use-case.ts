
import { IProcedureTypeRepository } from '../../../domain/repositories/iprocedure-type-repository';
import { ProcedureTypeDTO } from '../../../domain/types/procedure-type-dto';

export class ListProcedureTypesUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(): Promise<ProcedureTypeDTO[]> {
    return this.repo.findAll();
  }
}
