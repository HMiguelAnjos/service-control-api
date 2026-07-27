import { PaymentMethod } from '../../domain/entities/payment-method';

export interface IPaymentMethodRepository {
  create(pm: PaymentMethod): Promise<PaymentMethod>;
  update(
    id: number,
    businessId: number,
    patch: Partial<{
      name: string;
      feePercent: number;
      receiptDays: number;
      isActive: boolean;
    }>,
  ): Promise<PaymentMethod>;
  findOne(id: number, businessId: number): Promise<PaymentMethod | null>;
  listByBusiness(businessId: number, includeInactive?: boolean): Promise<PaymentMethod[]>;
  softDelete(id: number, businessId: number): Promise<void>;
}
