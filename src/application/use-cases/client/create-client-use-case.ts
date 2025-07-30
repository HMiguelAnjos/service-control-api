import { IClientRepository } from '../../../domain/repositories/iclient-repository';
import { Client } from '../../../domain/entities/client';

export class CreateClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(input: { name: string; phone?: string; email?: string }) {
    const entity = new Client(undefined, input.name, input.phone, input.email);
    if (!entity.isValid()) {
      throw new Error('Invalid client data');
    }
    await this.repo.create(entity);
  }
}
