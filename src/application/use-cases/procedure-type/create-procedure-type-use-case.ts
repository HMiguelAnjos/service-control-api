import { ProcedureType } from '../../../domain/entities/procedure-type';
import { IProcedureTypeRepository } from '../../ports/iprocedure-type-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(input: {
    userId: number;
    name: string;
    description?: string;
    costValue?: number;
    finalValue?: number;
    defaultDurationMinutes?: number | null;
    expectedIntervalDays?: number | null;
  }) {
    const entity = new ProcedureType(
      undefined,
      input.userId,
      input.name,
      input.description,
      input.costValue,
      input.finalValue,
      input.defaultDurationMinutes,
      input.expectedIntervalDays,
    );
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do tipo de procedimento inválidos');
    }
    await this.repo.create(entity);
  }
}
