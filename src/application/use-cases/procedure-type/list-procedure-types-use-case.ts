
import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';
import { ProcedureTypeDTO } from '../../dto/procedure-type-dto';

export class ListProcedureTypesUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(): Promise<ProcedureTypeDTO[]> {
    return this.repo.findAll();
  }
}
