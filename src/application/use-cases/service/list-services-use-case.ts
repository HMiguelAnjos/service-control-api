import { IServiceRepository } from '../../ports/iservice-repository';
import { ServiceDTO } from '../../dto/service-dto';

export class ListServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(): Promise<ServiceDTO[]> {
    return this.repo.findAll();
  }
}
