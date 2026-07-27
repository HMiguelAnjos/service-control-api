/**
 * Pure function that turns confirmed inputs into the frozen numbers we
 * store on the service row.  No I/O — makes it trivially unit-testable
 * and keeps the confirm use case readable.
 *
 * Money math uses `roundCents` (2 decimals) so results match the
 * Decimal(10,2) columns.  Margin uses 3 decimals to match Decimal(6,3).
 */

export interface SnapshotInsumo {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface SnapshotPayment {
  amount: number;
  feePercent: number;
}

export interface SnapshotInput {
  totalPrice: number;
  insumos: SnapshotInsumo[];
  durationMinutes: number | null;
  hourlyCost: number | null;
  fixedCostRateio: number;
  payments: SnapshotPayment[];
  /** Percent (0-100) applied to net profit BEFORE commission.  Null = no commission. */
  commissionPercent: number | null;
}

export interface SnapshotOutput {
  insumoCost: number;
  laborCost: number;
  fixedCost: number;
  paymentFee: number;
  commission: number;
  netProfit: number;
  marginPct: number;
}

function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function computeServiceSnapshot(input: SnapshotInput): SnapshotOutput {
  const insumoCost = roundCents(input.insumos.reduce((acc, i) => acc + i.quantity * i.unitCost, 0));

  const laborCost =
    input.durationMinutes && input.hourlyCost
      ? roundCents((input.durationMinutes / 60) * input.hourlyCost)
      : 0;

  const fixedCost = roundCents(input.fixedCostRateio);

  const paymentFee = roundCents(
    input.payments.reduce((acc, p) => acc + (p.amount * p.feePercent) / 100, 0),
  );

  // Profit BEFORE commission — the base on which commission is computed.
  const profitBeforeCommission =
    roundCents(input.totalPrice) - insumoCost - laborCost - fixedCost - paymentFee;

  const commission =
    input.commissionPercent && input.commissionPercent > 0
      ? roundCents((profitBeforeCommission * input.commissionPercent) / 100)
      : 0;

  const netProfit = roundCents(profitBeforeCommission - commission);

  const marginPct = input.totalPrice > 0 ? round3((netProfit / input.totalPrice) * 100) : 0;

  return { insumoCost, laborCost, fixedCost, paymentFee, commission, netProfit, marginPct };
}
