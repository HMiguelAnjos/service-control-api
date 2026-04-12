import { IServiceRepository } from '../../ports/iservice-repository';

export class ListClientServicesUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(clientId: number, userId: number) {
    return this.repo.findByClient(clientId, userId);
  }
}
