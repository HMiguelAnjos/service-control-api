import {
  AuthorizationResult,
  CalendarProviderEvent,
  CreateProviderEventInput,
  ICalendarProvider,
} from '../../application/ports/icalendar-provider';
import { CalendarIntegrationError } from '../../middlewares/errors/errors';

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new CalendarIntegrationError(`Variável de ambiente ${name} não configurada.`);
  return v;
}

interface GoogleApiEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  status?: string;
  htmlLink?: string;
}

function toEvent(g: GoogleApiEvent): CalendarProviderEvent {
  return {
    id: g.id,
    summary: g.summary ?? '',
    description: g.description ?? null,
    start: new Date(g.start?.dateTime ?? g.start?.date ?? ''),
    end: new Date(g.end?.dateTime ?? g.end?.date ?? ''),
    status: g.status === 'cancelled' ? 'cancelled' : g.status === 'tentative' ? 'tentative' : 'confirmed',
    htmlLink: g.htmlLink,
    source: 'external',
  };
}

async function googleFetch(input: string, init: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.text();
    throw new CalendarIntegrationError(
      `Google API error (${res.status}): ${body.slice(0, 300)}`,
      { status: res.status },
    );
  }
  return res;
}

export class GoogleCalendarProvider implements ICalendarProvider {
  buildAuthUrl({ state, redirectUri }: { state: string; redirectUri: string }): string {
    const params = new URLSearchParams({
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',     // returns a refresh_token
      prompt: 'consent',          // ensure we always get a refresh_token
      include_granted_scopes: 'true',
      state,
    });
    return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
  }

  async exchangeCode(input: { code: string; redirectUri: string }): Promise<AuthorizationResult> {
    const body = new URLSearchParams({
      code: input.code,
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: input.redirectUri,
      grant_type: 'authorization_code',
    });

    const res = await googleFetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      scope: string;
    };

    if (!data.refresh_token) {
      throw new CalendarIntegrationError(
        'Google não devolveu refresh_token. Revogue o acesso do app na conta Google e tente conectar novamente.',
      );
    }

    // Best-effort: get the user's email so we can show "connected as <email>".
    let email: string | undefined;
    try {
      const userRes = await fetch(USERINFO_URL, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userRes.ok) {
        const u = (await userRes.json()) as { email?: string };
        email = u.email;
      }
    } catch { /* ignore */ }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scope: data.scope,
      email,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: requireEnv('GOOGLE_CLIENT_ID'),
      client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    });

    const res = await googleFetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = (await res.json()) as { access_token: string; expires_in: number };
    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async revoke(refreshToken: string): Promise<void> {
    try {
      await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(refreshToken)}`, { method: 'POST' });
    } catch { /* swallow — best effort */ }
  }

  async createEvent(
    accessToken: string,
    calendarId: string,
    input: CreateProviderEventInput,
  ): Promise<CalendarProviderEvent> {
    const body = {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString() },
      end:   { dateTime: input.end.toISOString() },
      ...(input.appointmentId
        ? { extendedProperties: { private: { nine6_appointment_id: String(input.appointmentId) } } }
        : {}),
    };
    const res = await googleFetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    return toEvent((await res.json()) as GoogleApiEvent);
  }

  async updateEvent(
    accessToken: string,
    calendarId: string,
    eventId: string,
    input: CreateProviderEventInput,
  ): Promise<CalendarProviderEvent> {
    const body = {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString() },
      end:   { dateTime: input.end.toISOString() },
    };
    const res = await googleFetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    return toEvent((await res.json()) as GoogleApiEvent);
  }

  async deleteEvent(accessToken: string, calendarId: string, eventId: string): Promise<void> {
    const res = await fetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    // 404/410 = already gone — treat as success.
    if (!res.ok && res.status !== 404 && res.status !== 410) {
      const body = await res.text();
      throw new CalendarIntegrationError(
        `Google API error (${res.status}): ${body.slice(0, 300)}`,
        { status: res.status },
      );
    }
  }

  async listEvents(
    accessToken: string,
    calendarId: string,
    range: { from: Date; to: Date },
  ): Promise<CalendarProviderEvent[]> {
    const params = new URLSearchParams({
      timeMin: range.from.toISOString(),
      timeMax: range.to.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    const res = await googleFetch(
      `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const data = (await res.json()) as { items?: GoogleApiEvent[] };
    return (data.items ?? [])
      .filter(e => e.status !== 'cancelled' && (e.start?.dateTime || e.start?.date))
      .map(toEvent);
  }
}
