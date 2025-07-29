import { IClientRepository } from '../../../domain/repositories/iclient-repository';
import { Client } from '../../../domain/entities/client';
import { randomUUID } from 'crypto';

export class CreateClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(input: { name: string; phone?: string; email?: string }) {
    const entity = new Client(randomUUID(), input.name, input.phone, input.email);
    if (!entity.isValid()) {
      throw new Error('Invalid client data');
    }
    await this.repo.create(entity);
  }
}
