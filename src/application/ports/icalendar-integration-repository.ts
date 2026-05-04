import { CalendarIntegration } from '../../domain/entities/calendar-integration';

/**
 * Repository handles encryption/decryption of access/refresh tokens internally,
 * so callers only ever see plaintext values.
 */
export interface UpdateCalendarIntegrationInput {
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scope?: string;
  calendarId?: string;
  syncEnabled?: boolean;
  syncToken?: string | null;
  lastSyncedAt?: Date | null;
}

export interface ICalendarIntegrationRepository {
  upsert(integration: CalendarIntegration): Promise<CalendarIntegration>;
  findByUser(userId: number): Promise<CalendarIntegration | null>;
  update(userId: number, input: UpdateCalendarIntegrationInput): Promise<CalendarIntegration>;
  delete(userId: number): Promise<void>;
}
