import { IPaymentMethodRepository } from '../../ports/ipayment-method-repository';
import { NotFoundError } from '../../../middlewares/errors/errors';

export class DeletePaymentMethodUseCase {
  constructor(private repo: IPaymentMethodRepository) {}

  async execute(id: number, businessId: number): Promise<void> {
    const existing = await this.repo.findOne(id, businessId);
    if (!existing) throw new NotFoundError('Forma de pagamento');
    await this.repo.softDelete(id, businessId);
  }
}
