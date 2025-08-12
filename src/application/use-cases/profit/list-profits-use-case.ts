import { IProfitRepository } from '../../ports/iprofit-repository';
import { ProfitDTO } from '../../dto/profit-dto';

export class ListProfitsUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(): Promise<ProfitDTO[]> {
    return this.repo.findAll();
  }
}
