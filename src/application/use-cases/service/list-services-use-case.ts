import { IServiceRepository } from '../../../domain/repositories/iservice-repository';
import { ServiceDTO } from '../../../domain/types/service-dto';

export class ListServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(): Promise<ServiceDTO[]> {
    return this.repo.findAll();
  }
}
