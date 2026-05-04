import { ICalendarIntegrationRepository } from '../../ports/icalendar-integration-repository';

export interface IntegrationStatus {
  connected: boolean;
  provider?: string;
  syncEnabled?: boolean;
  lastSyncedAt?: string | null;
}

export class GetIntegrationStatusUseCase {
  constructor(private repo: ICalendarIntegrationRepository) {}

  async execute(userId: number): Promise<IntegrationStatus> {
    const integration = await this.repo.findByUser(userId);
    if (!integration) return { connected: false };
    return {
      connected: true,
      provider: integration.provider,
      syncEnabled: integration.syncEnabled,
      lastSyncedAt: integration.lastSyncedAt?.toISOString() ?? null,
    };
  }
}
