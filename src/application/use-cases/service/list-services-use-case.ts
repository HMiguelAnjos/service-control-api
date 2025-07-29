import { ServiceDTO } from '../../../../dtos/service-dto';
import { IServiceRepository } from '../../../domain/repositories/iservice-repository';

export class ListServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(): Promise<ServiceDTO[]> {
    return this.repo.findAll();
  }
}
