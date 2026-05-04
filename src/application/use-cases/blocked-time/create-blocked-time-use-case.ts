import { BlockedTime } from '../../../domain/entities/blocked-time';
import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface CreateBlockedTimeInput {
  userId: number;
  startTime: Date;
  endTime: Date;
  reason?: string | null;
}

export class CreateBlockedTimeUseCase {
  constructor(private repo: IBlockedTimeRepository) {}

  async execute(input: CreateBlockedTimeInput): Promise<BlockedTime> {
    const entity = new BlockedTime(input);
    if (!entity.isValid()) {
      throw new ValidationError('Bloqueio de horário inválido.');
    }
    return this.repo.create(entity);
  }
}
