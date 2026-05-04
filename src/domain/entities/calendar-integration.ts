/**
 * Connection between a professional (user) and an external calendar provider.
 * Tokens are stored encrypted at rest with AES-256-GCM (see token-crypto).
 */
export interface CalendarIntegrationData {
  id?: number;
  userId: number;
  provider?: string; // 'google'
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  scope: string;
  calendarId?: string; // 'primary' by default
  syncEnabled?: boolean;
  syncToken?: string | null;
  lastSyncedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CalendarIntegration {
  public readonly id?: number;
  public readonly userId: number;
  public readonly provider: string;
  public readonly accessToken: string;
  public readonly refreshToken: string;
  public readonly tokenExpiry: Date;
  public readonly scope: string;
  public readonly calendarId: string;
  public readonly syncEnabled: boolean;
  public readonly syncToken: string | null;
  public readonly lastSyncedAt: Date | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(data: CalendarIntegrationData) {
    this.id = data.id;
    this.userId = data.userId;
    this.provider = data.provider ?? 'google';
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.tokenExpiry = data.tokenExpiry;
    this.scope = data.scope;
    this.calendarId = data.calendarId ?? 'primary';
    this.syncEnabled = data.syncEnabled ?? true;
    this.syncToken = data.syncToken ?? null;
    this.lastSyncedAt = data.lastSyncedAt ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
