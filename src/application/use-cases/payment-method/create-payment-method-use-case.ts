import { PaymentMethod } from '../../../domain/entities/payment-method';
import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface CreatePaymentMethodInput {
  businessId: number;
  name: string;
  feePercent: number;
  receiptDays: number;
}

export class CreatePaymentMethodUseCase {
  constructor(private repo: IPaymentMethodRepository) {}

  async execute(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    const entity = new PaymentMethod(input);
    if (!entity.isValid()) {
      throw new ValidationError(
        'Forma de pagamento inválida (taxa entre 0 e 100%, prazo em dias ≥ 0, nome obrigatório).',
      );
    }
    return this.repo.create(entity);
  }
}
