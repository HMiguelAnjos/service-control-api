import { IClientRepository } from '../../ports/iclient-repository';
import { ClientDTO } from '../../dto/client-dto';

export class ListClientsUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(): Promise<ClientDTO[]> {
    return this.repo.findAll();
  }
}
