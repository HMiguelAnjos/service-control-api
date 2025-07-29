import { ProfitDTO } from '../../../../dtos/profit-dto';
import { IProfitRepository } from '../../../domain/repositories/iprofit-repository';

export class ListProfitsUseCase {
  constructor(private repo: IProfitRepository) {}

  async execute(): Promise<ProfitDTO[]> {
    return this.repo.findAll();
  }
}
