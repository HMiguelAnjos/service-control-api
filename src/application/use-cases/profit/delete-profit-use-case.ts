import { IProfitRepository } from '../../domain/repositories/iprofit-repository';

export class DeleteProfitUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
