import { IBlockedTimeRepository } from '../../ports/iblocked-time-repository';

export class DeleteBlockedTimeUseCase {
  constructor(private repo: IBlockedTimeRepository) {}

  async execute(id: number, userId: number): Promise<void> {
    await this.repo.delete(id, userId);
  }
}
