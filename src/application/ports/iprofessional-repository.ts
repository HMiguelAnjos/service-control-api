import { Professional } from '../../domain/entities/professional';

export interface CommissionRuleRow {
  id: number;
  professionalId: number;
  percent: number;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}

export interface UpdateProfessionalInput {
  name?: string;
  hourlyCost?: number | null;
  userId?: number | null;
  isActive?: boolean;
}

export interface IProfessionalRepository {
  create(entity: Professional): Promise<Professional>;
  update(id: number, businessId: number, patch: UpdateProfessionalInput): Promise<Professional>;
  softDelete(id: number, businessId: number): Promise<void>;

  findOne(id: number, businessId: number): Promise<Professional | null>;
  findByUserId(userId: number): Promise<Professional | null>;
  listByBusiness(businessId: number, includeInactive?: boolean): Promise<Professional[]>;

  /**
   * Sets the current commission percent.  If a rule is active (endDate=null),
   * closes it with `endDate=startDate` and inserts a new one — that way
   * services already confirmed keep the percent they were paid at
   * (rule 10: commission versionada, snapshots imutáveis).
   */
  setCommissionPercent(input: {
    professionalId: number;
    businessId: number;
    percent: number;
    startDate?: Date;
  }): Promise<CommissionRuleRow>;

  /** Full commission history for a professional, most recent first. */
  listCommissionRules(professionalId: number, businessId: number): Promise<CommissionRuleRow[]>;

  /**
   * Returns the commission percent that was in effect on the given date.
   * Uses the commission_rule history (startDate/endDate).  Null if the
   * professional has no rule for that date.
   */
  getCommissionPercentAt(professionalId: number, date: Date): Promise<number | null>;
}
