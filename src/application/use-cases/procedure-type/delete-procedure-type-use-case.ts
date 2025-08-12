import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';

export class DeleteProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
