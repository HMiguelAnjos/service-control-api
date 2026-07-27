import { IProfessionalRepository, CommissionRuleRow } from '../../ports/iprofessional-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface SetCommissionPercentInput {
  professionalId: number;
  businessId: number;
  percent: number;
  startDate?: Date;
}

/**
 * Cria uma nova regra de comissão fechando a atual (se houver).
 * Serviços já confirmados mantêm o percentual congelado no snapshot —
 * a nova regra só afeta atendimentos futuros (regra 10).
 */
export class SetCommissionPercentUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(input: SetCommissionPercentInput): Promise<CommissionRuleRow> {
    if (!Number.isFinite(input.percent) || input.percent < 0 || input.percent > 100) {
      throw new ValidationError('Percentual deve ficar entre 0 e 100.');
    }
    return this.repo.setCommissionPercent(input);
  }
}
