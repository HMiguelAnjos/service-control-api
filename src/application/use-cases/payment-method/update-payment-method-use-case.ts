import { PaymentMethod } from '../../../domain/entities/payment-method';
import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export interface UpdatePaymentMethodInput {
  id: number;
  businessId: number;
  name?: string;
  feePercent?: number;
  receiptDays?: number;
  isActive?: boolean;
}

export class UpdatePaymentMethodUseCase {
  constructor(private repo: IPaymentMethodRepository) {}

  async execute(input: UpdatePaymentMethodInput): Promise<PaymentMethod> {
    const existing = await this.repo.findOne(input.id, input.businessId);
    if (!existing) throw new NotFoundError('Forma de pagamento');

    if (input.feePercent !== undefined && (input.feePercent < 0 || input.feePercent > 100)) {
      throw new ValidationError('Taxa deve ficar entre 0 e 100%.');
    }
    if (input.receiptDays !== undefined && input.receiptDays < 0) {
      throw new ValidationError('Prazo em dias precisa ser ≥ 0.');
    }
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError('Nome não pode ficar vazio.');
    }

    return this.repo.update(input.id, input.businessId, {
      name: input.name,
      feePercent: input.feePercent,
      receiptDays: input.receiptDays,
      isActive: input.isActive,
    });
  }
}
