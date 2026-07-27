import { FixedCost } from '../../../domain/entities/fixed-cost';
import { IFixedCostRepository } from '../../ports/ifixed-cost-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface CreateFixedCostInput {
  businessId: number;
  name: string;
  monthlyAmount: number;
  startDate?: Date;
  endDate?: Date | null;
}

export class CreateFixedCostUseCase {
  constructor(private repo: IFixedCostRepository) {}

  async execute(input: CreateFixedCostInput): Promise<FixedCost> {
    const entity = new FixedCost(input);
    if (!entity.isValid()) {
      throw new ValidationError('Custo fixo inválido (nome + valor > 0; endDate ≥ startDate).');
    }
    return this.repo.create(entity);
  }
}
