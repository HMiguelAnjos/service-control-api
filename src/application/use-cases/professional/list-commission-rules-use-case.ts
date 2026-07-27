import { IProfessionalRepository, CommissionRuleRow } from '../../ports/iprofessional-repository';

export class ListCommissionRulesUseCase {
  constructor(private repo: IProfessionalRepository) {}

  async execute(professionalId: number, businessId: number): Promise<CommissionRuleRow[]> {
    return this.repo.listCommissionRules(professionalId, businessId);
  }
}
