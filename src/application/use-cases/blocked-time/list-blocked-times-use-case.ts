import { BlockedTime } from '../../../domain/entities/blocked-time';
import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';

export class ListBlockedTimesUseCase {
  constructor(private repo: IBlockedTimeRepository) {}

  async execute(userId: number, from?: Date, to?: Date): Promise<BlockedTime[]> {
    return this.repo.list(userId, from, to);
  }
}
