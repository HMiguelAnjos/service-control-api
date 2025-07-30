import { randomUUID } from 'crypto';
import { ProcedureType } from '../../../domain/entities/procedure-type';
import { IProcedureTypeRepository } from '../../../domain/repositories/iprocedure-type-repository';

export class CreateProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(input: { name: string; description?: string }) {
    const entity = new ProcedureType(undefined, input.name, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid proceduretype data');
    }
    await this.repo.create(entity);
  }
}
