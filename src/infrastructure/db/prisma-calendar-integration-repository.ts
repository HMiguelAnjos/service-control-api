import { CalendarIntegration } from '../../domain/entities/calendar-integration';
import {
  ICalendarIntegrationRepository,
  UpdateCalendarIntegrationInput,
} from '../../application/ports/icalendar-integration-repository';
import { encryptToken, decryptToken } from '../calendar/token-crypto';
import prisma from './prisma';

/**
 * Repo encrypts/decrypts tokens transparently — outside this file, callers
 * always see plaintext access/refresh tokens.
 */
function rowToEntity(r: any): CalendarIntegration {
  return new CalendarIntegration({
    id: r.id,
    userId: r.userId,
    provider: r.provider,
    accessToken: decryptToken(r.accessToken),
    refreshToken: decryptToken(r.refreshToken),
    tokenExpiry: r.tokenExpiry,
    scope: r.scope,
    calendarId: r.calendarId,
    syncEnabled: r.syncEnabled,
    syncToken: r.syncToken,
    lastSyncedAt: r.lastSyncedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  });
}

export class PrismaCalendarIntegrationRepository implements ICalendarIntegrationRepository {
  async upsert(integration: CalendarIntegration): Promise<CalendarIntegration> {
    const data = {
      userId: integration.userId,
      provider: integration.provider,
      accessToken: encryptToken(integration.accessToken),
      refreshToken: encryptToken(integration.refreshToken),
      tokenExpiry: integration.tokenExpiry,
      scope: integration.scope,
      calendarId: integration.calendarId,
      syncEnabled: integration.syncEnabled,
      syncToken: integration.syncToken,
      lastSyncedAt: integration.lastSyncedAt,
    };
    const saved = await prisma.calendar_integration.upsert({
      where: { userId: integration.userId },
      create: data,
      update: data,
    });
    return rowToEntity(saved);
  }

  async findByUser(userId: number): Promise<CalendarIntegration | null> {
    const r = await prisma.calendar_integration.findUnique({ where: { userId } });
    return r ? rowToEntity(r) : null;
  }

  async update(userId: number, input: UpdateCalendarIntegrationInput): Promise<CalendarIntegration> {
    const data: any = {};
    if (input.accessToken !== undefined)   data.accessToken = encryptToken(input.accessToken);
    if (input.refreshToken !== undefined)  data.refreshToken = encryptToken(input.refreshToken);
    if (input.tokenExpiry !== undefined)   data.tokenExpiry = input.tokenExpiry;
    if (input.scope !== undefined)         data.scope = input.scope;
    if (input.calendarId !== undefined)    data.calendarId = input.calendarId;
    if (input.syncEnabled !== undefined)   data.syncEnabled = input.syncEnabled;
    if (input.syncToken !== undefined)     data.syncToken = input.syncToken;
    if (input.lastSyncedAt !== undefined)  data.lastSyncedAt = input.lastSyncedAt;

    const updated = await prisma.calendar_integration.update({
      where: { userId },
      data,
    });
    return rowToEntity(updated);
  }

  async delete(userId: number): Promise<void> {
    await prisma.calendar_integration.deleteMany({ where: { userId } });
  }
}
