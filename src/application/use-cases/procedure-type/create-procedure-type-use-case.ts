import { IProcedureTypeRepository } from '../../domain/repositories/iproceduretype-repository';
import { ProcedureType } from '../../../domain/entities/proceduretype';
import { randomUUID } from 'crypto';

export class CreateProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(input: { name: string; description?: string }) {
    const entity = new ProcedureType(randomUUID(), input.name, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid proceduretype data');
    }
    await this.repo.create(entity);
  }
}
