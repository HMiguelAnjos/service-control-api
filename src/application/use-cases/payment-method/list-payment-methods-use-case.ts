import { PaymentMethod } from '../../../domain/entities/payment-method';
import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';

export class ListPaymentMethodsUseCase {
  constructor(private repo: IPaymentMethodRepository) {}

  async execute(businessId: number, includeInactive = false): Promise<PaymentMethod[]> {
    return this.repo.listByBusiness(businessId, includeInactive);
  }
}
