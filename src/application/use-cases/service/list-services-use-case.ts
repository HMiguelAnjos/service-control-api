import { IServiceRepository } from '../../ports/iservice-repository';
import { Service } from '../../../domain/entities/service';
import { Page, PaginationParams } from '../../utils/pagination';

export class ListServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(userId: number): Promise<Service[]> {
    return this.repo.findAll(userId);
  }

  async executePaginated(userId: number, params: PaginationParams): Promise<Page<Service>> {
    return this.repo.findPage(userId, params);
  }
}
