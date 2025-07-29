import { IProcedureTypeRepository } from '../../domain/repositories/iproceduretype-repository';
import { ProcedureType } from '../../../domain/entities/proceduretype';

export class UpdateProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(input: { id: string; name: string; description?: string }) {
    const entity = new ProcedureType(input.id, input.name, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid proceduretype data');
    }
    await this.repo.update(entity);
  }
}
