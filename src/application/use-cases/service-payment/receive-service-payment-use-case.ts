import {
  IServicePaymentRepository,
  ServicePaymentRow,
} from '../../ports/iservice-payment-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface ReceiveServicePaymentInput {
  id: number;
  businessId: number;
  actualAmount: number;
  actualReceiptAt?: Date;
}

export interface ReceiveResult {
  row: ServicePaymentRow;
  /** Diferença entre valor real e valor líquido esperado (negativo = recebeu menos). */
  divergence: number;
}

/**
 * Marks a service_payment as received.  If the reported amount diverges
 * from the expected `netAmount`, the response echoes the divergence so
 * the UI can flag it — the write itself succeeds regardless (regra 6).
 */
export class ReceiveServicePaymentUseCase {
  constructor(private repo: IServicePaymentRepository) {}

  async execute(input: ReceiveServicePaymentInput): Promise<ReceiveResult> {
    if (!Number.isFinite(input.actualAmount) || input.actualAmount < 0) {
      throw new ValidationError('actualAmount inválido.');
    }
    const at = input.actualReceiptAt ?? new Date();
    const row = await this.repo.markReceived(input.id, input.businessId, input.actualAmount, at);
    return {
      row,
      divergence: Math.round((input.actualAmount - row.netAmount) * 100) / 100,
    };
  }
}
