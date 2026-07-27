import {
  IServicePaymentRepository,
  ServicePaymentRow,
} from '../../ports/iservice-payment-repository';

export class ListDivergencesUseCase {
  constructor(private repo: IServicePaymentRepository) {}

  async execute(businessId: number): Promise<ServicePaymentRow[]> {
    return this.repo.listDivergences(businessId);
  }
}
