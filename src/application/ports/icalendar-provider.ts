/**
 * Abstraction over an external calendar provider (Google, Outlook, …).
 * The use cases depend on this port; the Google implementation lives in
 * `infrastructure/calendar/google-calendar-provider.ts`.
 */
export interface CalendarProviderEvent {
  id: string;
  summary: string;
  description?: string | null;
  start: Date;
  end: Date;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  source?: 'system' | 'external';
}

export interface CreateProviderEventInput {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  /** Optional metadata so we can find the system-created event later. */
  appointmentId?: number;
}

export interface AuthorizationResult {
  /** Access token (short-lived, e.g. 1h on Google). */
  accessToken: string;
  /** Refresh token (long-lived; only returned the first time the user authorises). */
  refreshToken: string;
  /** Absolute expiry instant of the access token. */
  expiresAt: Date;
  scope: string;
  /** External account email so we can show "connected as <email>". */
  email?: string;
}

export interface ICalendarProvider {
  /** URL the front sends the user to in order to authorise. */
  buildAuthUrl(input: { state: string; redirectUri: string }): string;

  /** Exchange the OAuth `code` for tokens. */
  exchangeCode(input: { code: string; redirectUri: string }): Promise<AuthorizationResult>;

  /** Refresh the access token using the stored refresh token. */
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }>;

  /** Revoke the user's authorisation (best-effort). */
  revoke(refreshToken: string): Promise<void>;

  createEvent(accessToken: string, calendarId: string, input: CreateProviderEventInput): Promise<CalendarProviderEvent>;
  updateEvent(accessToken: string, calendarId: string, eventId: string, input: CreateProviderEventInput): Promise<CalendarProviderEvent>;
  deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void>;
  listEvents(accessToken: string, calendarId: string, range: { from: Date; to: Date }): Promise<CalendarProviderEvent[]>;
}
