import { IServiceRepository } from '../../ports/iservice-repository';
import { Service } from '../../../domain/entities/service';

export class ListServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(userId: number): Promise<Service[]> {
    return this.repo.findAll(userId);
  }
}
