import {
  IServicePaymentRepository,
  ServicePaymentRow,
} from '../../ports/iservice-payment-repository';

export type ServicePaymentStatus = 'pending' | 'received' | 'overdue' | 'all';

export interface ListServicePaymentsInput {
  businessId: number;
  from?: Date;
  to?: Date;
  status?: ServicePaymentStatus;
}

export class ListServicePaymentsUseCase {
  constructor(private repo: IServicePaymentRepository) {}

  async execute(input: ListServicePaymentsInput): Promise<ServicePaymentRow[]> {
    return this.repo.list(input.businessId, {
      from: input.from,
      to: input.to,
      status: input.status,
    });
  }
}
