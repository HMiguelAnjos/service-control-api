import { FixedCost } from '../../domain/entities/fixed-cost';

export interface IFixedCostRepository {
  create(cost: FixedCost): Promise<FixedCost>;
  update(
    id: number,
    businessId: number,
    patch: Partial<{
      name: string;
      monthlyAmount: number;
      startDate: Date;
      endDate: Date | null;
      isActive: boolean;
    }>,
  ): Promise<FixedCost>;
  findOne(id: number, businessId: number): Promise<FixedCost | null>;
  listByBusiness(businessId: number, includeInactive?: boolean): Promise<FixedCost[]>;
  softDelete(id: number, businessId: number): Promise<void>;

  /**
   * Sum of monthly_amount for every fixed_cost that was active during the
   * given month (any overlap between [monthStart, monthEnd] and the
   * cost's [startDate, endDate ?? +∞] window).  Used by the rateio math.
   */
  totalMonthlyForBusiness(businessId: number, month: Date): Promise<number>;
}
