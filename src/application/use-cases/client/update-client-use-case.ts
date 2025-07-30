import { IClientRepository } from '../../../domain/repositories/iclient-repository';
import { Client } from '../../../domain/entities/client';

export class UpdateClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(input: { id: string; name: string; phone?: string; email?: string }) {
    const entity = new Client(undefined, input.name, input.phone, input.email);
    if (!entity.isValid()) {
      throw new Error('Invalid client data');
    }
    await this.repo.update(entity);
  }
}
