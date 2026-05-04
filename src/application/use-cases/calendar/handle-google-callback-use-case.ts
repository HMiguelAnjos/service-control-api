import { CalendarIntegration } from '../../../domain/entities/calendar-integration';
import { ICalendarProvider } from '../../ports/icalendar-provider';
import { ICalendarIntegrationRepository } from '../../ports/icalendar-integration-repository';
import { verifyOAuthState } from './google-oauth-state';
import { CalendarIntegrationError } from '../../../middlewares/errors/errors';

export class HandleGoogleCallbackUseCase {
  constructor(
    private provider: ICalendarProvider,
    private repo: ICalendarIntegrationRepository,
  ) {}

  async execute(input: { code: string; state: string }): Promise<{ userId: number; email?: string }> {
    const { userId } = verifyOAuthState(input.state);

    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
      throw new CalendarIntegrationError('GOOGLE_REDIRECT_URI não configurado.');
    }

    const result = await this.provider.exchangeCode({ code: input.code, redirectUri });

    const integration = new CalendarIntegration({
      userId,
      provider: 'google',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenExpiry: result.expiresAt,
      scope: result.scope,
      calendarId: 'primary',
      syncEnabled: true,
    });

    await this.repo.upsert(integration);
    return { userId, email: result.email };
  }
}
