import { IClientRepository } from '../../../domain/repositories/iclient-repository';
import { ClientDTO } from '../../../domain/types/client-dto';

export class ListClientsUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(): Promise<ClientDTO[]> {
    return this.repo.findAll();
  }
}
