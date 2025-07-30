import { IProfitRepository } from '../../../domain/repositories/iprofit-repository';
import { ProfitDTO } from '../../../domain/types/profit-dto';

export class ListProfitsUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(): Promise<ProfitDTO[]> {
    return this.repo.findAll();
  }
}
