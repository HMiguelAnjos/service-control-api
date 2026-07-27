import { Professional } from '../../domain/entities/professional';

export interface CreateCommissionRuleInput {
  professionalId: number;
  percent: number;
  startDate?: Date;
}

export interface IProfessionalRepository {
  findOne(id: number, businessId: number): Promise<Professional | null>;
  findByUserId(userId: number): Promise<Professional | null>;
  listByBusiness(businessId: number): Promise<Professional[]>;

  /**
   * Returns the commission percent that was in effect on the given date.
   * Uses the commission_rule history (startDate/endDate).  Null if the
   * professional has no rule for that date.
   */
  getCommissionPercentAt(professionalId: number, date: Date): Promise<number | null>;
}
