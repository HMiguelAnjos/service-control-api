import {
  IServicePaymentRepository,
  CashFlowSummary,
} from '../../ports/iservice-payment-repository';

const DEFAULT_BUCKETS = [7, 15, 30];

export class GetCashFlowProjectionUseCase {
  constructor(private repo: IServicePaymentRepository) {}

  async execute(businessId: number, buckets: number[] = DEFAULT_BUCKETS): Promise<CashFlowSummary> {
    const clean = buckets
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
    return this.repo.cashFlowProjection(
      businessId,
      new Date(),
      clean.length > 0 ? clean : DEFAULT_BUCKETS,
    );
  }
}
