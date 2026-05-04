import { AvailabilityRule } from '../../domain/entities/availability-rule';

export interface IAvailabilityRepository {
  listByUser(userId: number): Promise<AvailabilityRule[]>;
  /** Replace the user's full set of rules in a single transaction. */
  replaceForUser(userId: number, rules: AvailabilityRule[]): Promise<AvailabilityRule[]>;
}
