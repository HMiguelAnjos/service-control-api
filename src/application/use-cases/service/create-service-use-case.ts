import { Service } from '../../../domain/entities/service';
import { IServiceRepository } from '../../ports/iservice-repository';

export class CreateServiceUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(input: {
    clientId: number;
    procedureId: number;
    price: number;
    date?: Date;
    description: string;
  }) {
    const entity = new Service(
      undefined,
      input.clientId,
      input.procedureId,
      input.price,
      input.date ?? new Date(),
      input.description,
    );
    if (!entity.isValid()) {
      throw new Error('Invalid service data');
    }
    await this.repo.create(entity);
  }
}
