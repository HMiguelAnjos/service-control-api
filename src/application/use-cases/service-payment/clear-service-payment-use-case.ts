import {
  IServicePaymentRepository,
  ServicePaymentRow,
} from '../../ports/iservice-payment-repository';

/**
 * Undo a "mark received" — sets `actual_receipt_at` and `actual_amount`
 * back to null.  Useful when the user marked wrong.  The snapshot on
 * the service itself is untouched (only the reconciliation state changes).
 */
export class ClearServicePaymentUseCase {
  constructor(private repo: IServicePaymentRepository) {}

  async execute(id: number, businessId: number): Promise<ServicePaymentRow> {
    return this.repo.clearReceived(id, businessId);
  }
}
