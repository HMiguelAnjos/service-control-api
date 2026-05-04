import { ICalendarProvider } from '../../ports/icalendar-provider';
import { signOAuthState } from './google-oauth-state';
import { CalendarIntegrationError } from '../../../middlewares/errors/errors';

export class GetGoogleAuthUrlUseCase {
  constructor(private provider: ICalendarProvider) {}

  execute(userId: number): { url: string } {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!redirectUri) {
      throw new CalendarIntegrationError('GOOGLE_REDIRECT_URI não configurado.');
    }
    const state = signOAuthState(userId);
    return { url: this.provider.buildAuthUrl({ state, redirectUri }) };
  }
}
