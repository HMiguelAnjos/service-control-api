import { CalendarIntegration } from '../../../domain/entities/calendar-integration';
import { ICalendarIntegrationRepository } from '../../ports/icalendar-integration-repository';
import { ICalendarProvider } from '../../ports/icalendar-provider';

const SAFETY_MARGIN_MS = 60 * 1000; // refresh if token expires in <60s

/**
 * Returns a non-expired access token, refreshing it via the provider if
 * needed and persisting the refreshed token back to the DB.
 */
export async function getValidAccessToken(
  integration: CalendarIntegration,
  provider: ICalendarProvider,
  repo: ICalendarIntegrationRepository,
): Promise<{ accessToken: string; integration: CalendarIntegration }> {
  if (integration.tokenExpiry.getTime() - Date.now() > SAFETY_MARGIN_MS) {
    return { accessToken: integration.accessToken, integration };
  }

  const refreshed = await provider.refreshAccessToken(integration.refreshToken);
  const updated = await repo.update(integration.userId, {
    accessToken: refreshed.accessToken,
    tokenExpiry: refreshed.expiresAt,
  });
  return { accessToken: refreshed.accessToken, integration: updated };
}
