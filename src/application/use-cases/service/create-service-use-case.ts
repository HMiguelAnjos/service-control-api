import { Service } from '../../../domain/entities/service';
import { IServiceRepository } from '../../ports/iservice-repository';
import { IProfitRepository } from '../../ports/iprofit-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateServiceUseCase {
  constructor(
    private repo: IServiceRepository,
    private profitRepo: IProfitRepository,
  ) {}

  async execute(input: {
    userId: number;
    clientId: number;
    procedureId: number;
    price: number;
    date?: Date;
    description?: string;
  }) {
    const entity = new Service(
      undefined,
      input.userId,
      input.clientId,
      input.procedureId,
      input.price,
      input.date ?? new Date(),
      input.description,
    );
    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do atendimento inválidos');
    }
    const created = await this.repo.create(entity);
    await this.profitRepo.upsertForService(created.id!, input.price, 100);
  }
}
