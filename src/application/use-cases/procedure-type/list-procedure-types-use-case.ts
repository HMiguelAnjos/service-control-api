import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';
import { ProcedureType } from '../../../domain/entities/procedure-type';

export class ListProcedureTypesUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(userId: number): Promise<ProcedureType[]> {
    return this.repo.findAll(userId);
  }
}
