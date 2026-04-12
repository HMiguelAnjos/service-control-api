import { IClientRepository } from '../../ports/iclient-repository';
import { Client } from '../../../domain/entities/client';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(input: { id: number; userId: number; name: string; phone?: string; email?: string }) {
    const entity = new Client(input.id, input.userId, input.name, input.phone, input.email);
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do cliente inválidos');
    }
    await this.repo.update(entity);
  }
}
