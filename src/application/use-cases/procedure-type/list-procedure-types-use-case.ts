import { ProcedureTypeDTO } from '../../../../dtos/procedure-type-dto';
import { IProcedureTypeRepository } from '../../../domain/repositories/iprocedure-type-repository';

export class ListProcedureTypesUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(): Promise<ProcedureTypeDTO[]> {
    return this.repo.findAll();
  }
}
