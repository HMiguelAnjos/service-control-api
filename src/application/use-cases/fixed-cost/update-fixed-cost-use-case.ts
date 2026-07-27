import { FixedCost } from '../../../domain/entities/fixed-cost';
import { IFixedCostRepository } from '../../ports/ifixed-cost-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export interface UpdateFixedCostInput {
  id: number;
  businessId: number;
  patch: Partial<{
    name: string;
    monthlyAmount: number;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
  }>;
}

export class UpdateFixedCostUseCase {
  constructor(private repo: IFixedCostRepository) {}

  async execute(input: UpdateFixedCostInput): Promise<FixedCost> {
    const existing = await this.repo.findOne(input.id, input.businessId);
    if (!existing) throw new NotFoundError('Custo fixo');

    const { patch } = input;
    if (patch.name !== undefined && patch.name.trim().length === 0) {
      throw new ValidationError('Nome não pode ficar vazio.');
    }
    if (patch.monthlyAmount !== undefined && patch.monthlyAmount < 0) {
      throw new ValidationError('Valor mensal não pode ser negativo.');
    }
    return this.repo.update(input.id, input.businessId, patch);
  }
}
