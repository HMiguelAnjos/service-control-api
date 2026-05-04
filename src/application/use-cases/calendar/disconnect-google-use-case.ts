import { ICalendarProvider } from '../../ports/icalendar-provider';
import { ICalendarIntegrationRepository } from '../../ports/icalendar-integration-repository';

export class DisconnectGoogleUseCase {
  constructor(
    private provider: ICalendarProvider,
    private repo: ICalendarIntegrationRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    const integration = await this.repo.findByUser(userId);
    if (!integration) return;
    // Best-effort revoke; we delete locally regardless.
    await this.provider.revoke(integration.refreshToken).catch(() => {});
    await this.repo.delete(userId);
  }
}
