import { AvailabilityRule, AvailabilityRuleData } from '../../../domain/entities/availability-rule';
import { IAvailabilityRepository } from '../../ports/iavailability-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface ReplaceAvailabilityRulesInput {
  userId: number;
  rules: Array<Omit<AvailabilityRuleData, 'userId' | 'id'>>;
}

export class ReplaceAvailabilityRulesUseCase {
  constructor(private repo: IAvailabilityRepository) {}

  async execute(input: ReplaceAvailabilityRulesInput): Promise<AvailabilityRule[]> {
    const entities = input.rules.map(r =>
      new AvailabilityRule({
        userId: input.userId,
        dayOfWeek: r.dayOfWeek,
        startMinutes: r.startMinutes,
        endMinutes: r.endMinutes,
        isActive: r.isActive ?? true,
      }),
    );

    for (const entity of entities) {
      if (!entity.isValid()) {
        throw new ValidationError(
          'Regra de disponibilidade inválida (verifique dia da semana e horários).',
          { dayOfWeek: entity.dayOfWeek, startMinutes: entity.startMinutes, endMinutes: entity.endMinutes },
        );
      }
    }

    return this.repo.replaceForUser(input.userId, entities);
  }
}
