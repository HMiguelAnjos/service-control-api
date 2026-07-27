export interface ServicePaymentRow {
  id: number;
  serviceId: number;
  paymentMethodId: number;
  paymentMethodName: string;
  clientName: string;
  amount: number;
  feePercent: number;
  feeAmount: number;
  netAmount: number;
  expectedReceiptAt: Date;
  actualReceiptAt: Date | null;
  actualAmount: number | null;
}

export interface CashFlowBucket {
  /** Label like "7d" / "15d" / "30d". */
  key: string;
  /** Absolute end date of the bucket (inclusive). */
  endDate: Date;
  /** Sum of expected net_amount that lands inside this bucket and is still open. */
  expectedNet: number;
  /** How many receipts are inside the bucket. */
  count: number;
}

export interface CashFlowSummary {
  now: Date;
  buckets: CashFlowBucket[];
  receivedThisMonth: number;
  expectedThisMonthRemaining: number;
  overdue: {
    total: number;
    count: number;
  };
}

export interface IServicePaymentRepository {
  findOne(id: number, businessId: number): Promise<ServicePaymentRow | null>;

  /**
   * Marks a service_payment as received.  If `actualAmount` diverges from
   * the stored `netAmount`, callers can render it as a divergence — the
   * repo does NOT reject.
   */
  markReceived(
    id: number,
    businessId: number,
    actualAmount: number,
    actualReceiptAt: Date,
  ): Promise<ServicePaymentRow>;

  /** Undo — sets actual fields back to null.  Useful for correcting mistakes. */
  clearReceived(id: number, businessId: number): Promise<ServicePaymentRow>;

  cashFlowProjection(
    businessId: number,
    referenceDate: Date,
    bucketsDays: number[],
  ): Promise<CashFlowSummary>;

  /**
   * Payments where `actualAmount != netAmount` (after being marked received)
   * or `expectedReceiptAt < now` and still open (overdue = implicit divergence).
   */
  listDivergences(businessId: number): Promise<ServicePaymentRow[]>;

  /** Simple filtered list for the dashboard drill-down. */
  list(
    businessId: number,
    opts: {
      from?: Date;
      to?: Date;
      status?: 'pending' | 'received' | 'overdue' | 'all';
    },
  ): Promise<ServicePaymentRow[]>;
}
