import { IProcedureTypeRepository } from '../../../domain/repositories/iprocedure-type-repository';

export class DeleteProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
