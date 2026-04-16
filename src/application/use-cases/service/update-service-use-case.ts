import { IServiceRepository } from '../../ports/iservice-repository';
import { Service, ServiceProcedureInput } from '../../../domain/entities/service';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class UpdateServiceUseCase {
  constructor(
    private repo: IServiceRepository,
  ) {}

  async execute(input: {
    id: number;
    userId: number;
    clientId: number;
    procedures: ServiceProcedureInput[];
    date?: Date;
    description?: string;
  }) {
    if (!input.procedures || input.procedures.length === 0) {
      throw new BadRequest(400, 'Pelo menos um procedimento é obrigatório');
    }

    const totalPrice = input.procedures.reduce((sum, p) => sum + p.price, 0);

    const entity = new Service(
      input.id,
      input.userId,
      input.clientId,
      totalPrice,
      input.date ?? new Date(),
      input.description,
      input.procedures,
    );

    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do atendimento inválidos');
    }

    await this.repo.update(entity);
  }
}
