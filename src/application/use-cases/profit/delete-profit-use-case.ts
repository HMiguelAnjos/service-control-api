import { IProfitRepository } from '../../ports/iprofit-repository';

export class DeleteProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(id: number, userId: number) {
    await this.repo.delete(id, userId);
  }
}
