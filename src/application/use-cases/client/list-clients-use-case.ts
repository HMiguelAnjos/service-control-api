import { ClientDTO } from '../../../../dtos/client-dto';
import { IClientRepository } from '../../../domain/repositories/iclient-repository';

export class ListClientsUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(): Promise<ClientDTO[]> {
    return this.repo.findAll();
  }
}
