import { IProfitRepository } from '../../ports/iprofit-repository';
import { Profit } from '../../../domain/entities/profit';

export class ListProfitsUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(userId: number): Promise<Profit[]> {
    return this.repo.findAll(userId);
  }
}
