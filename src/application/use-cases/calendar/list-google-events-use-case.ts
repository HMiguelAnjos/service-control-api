import { ICalendarProvider, CalendarProviderEvent } from '../../ports/icalendar-provider';
import { ICalendarIntegrationRepository } from '../../ports/icalendar-integration-repository';
import { getValidAccessToken } from './google-token-helper';

export class ListGoogleEventsUseCase {
  constructor(
    private provider: ICalendarProvider,
    private repo: ICalendarIntegrationRepository,
  ) {}

  async execute(userId: number, range: { from: Date; to: Date }): Promise<CalendarProviderEvent[]> {
    const integration = await this.repo.findByUser(userId);
    if (!integration || !integration.syncEnabled) return [];

    const { accessToken, integration: updated } = await getValidAccessToken(
      integration,
      this.provider,
      this.repo,
    );

    return this.provider.listEvents(accessToken, updated.calendarId, range);
  }
}
