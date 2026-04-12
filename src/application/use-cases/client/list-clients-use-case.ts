import { IClientRepository } from '../../ports/iclient-repository';
import { Client } from '../../../domain/entities/client';

export class ListClientsUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(userId: number): Promise<Client[]> {
    return this.repo.findAll(userId);
  }
}
