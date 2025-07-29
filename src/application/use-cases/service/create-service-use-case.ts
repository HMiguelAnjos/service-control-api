import { IServiceRepository } from '../../domain/repositories/iservice-repository';
import { Service } from '../../../domain/entities/service';
import { randomUUID } from 'crypto';

export class CreateServiceUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(input: { clientId: string; procedureId: string; description: string; price: number; date?: Date }) {
    const entity = new Service(randomUUID(), input.clientId, input.procedureId, input.description, input.price, input.date ?? new Date());
    if (!entity.isValid()) {
      throw new Error('Invalid service data');
    }
    await this.repo.create(entity);
  }
}
