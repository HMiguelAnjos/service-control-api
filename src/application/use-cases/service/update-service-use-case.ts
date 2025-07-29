import { IServiceRepository } from '../../domain/repositories/iservice-repository';
import { Service } from '../../../domain/entities/service';

export class UpdateServiceUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(input: { id: string; clientId: string; procedureId: string; description: string; price: number; date?: Date }) {
    const entity = new Service(input.id, input.clientId, input.procedureId, input.description, input.price, input.date ?? new Date());
    if (!entity.isValid()) {
      throw new Error('Invalid service data');
    }
    await this.repo.update(entity);
  }
}
