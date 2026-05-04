import { IClientRepository } from '../../ports/iclient-repository';
import { Client } from '../../../domain/entities/client';
import { Page, PaginationParams } from '../../utils/pagination';

export class ListClientsUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(userId: number): Promise<Client[]> {
    return this.repo.findAll(userId);
  }

  async executePaginated(userId: number, params: PaginationParams): Promise<Page<Client>> {
    return this.repo.findPage(userId, params);
  }
}
