import { Appointment } from '../../domain/entities/appointment';
import { ICalendarProvider } from '../ports/icalendar-provider';
import { ICalendarIntegrationRepository } from '../ports/icalendar-integration-repository';
import { IAppointmentRepository } from '../ports/iappointment-repository';
import { getValidAccessToken } from '../use-cases/calendar/google-token-helper';
import { log } from '../../config/logger';

/**
 * Push appointment changes to the user's Google Calendar (if connected).
 * Failures are logged but never throw, so the local CRUD operation remains
 * the source of truth and the system keeps working when Google is unreachable.
 */
export class AppointmentGoogleSync {
  constructor(
    private provider: ICalendarProvider,
    private integrationRepo: ICalendarIntegrationRepository,
    private appointmentRepo: IAppointmentRepository,
  ) {}

  private async getTokenAndCalendar(userId: number): Promise<
    { accessToken: string; calendarId: string } | null
  > {
    const integration = await this.integrationRepo.findByUser(userId);
    if (!integration || !integration.syncEnabled) return null;
    try {
      const { accessToken, integration: updated } = await getValidAccessToken(
        integration,
        this.provider,
        this.integrationRepo,
      );
      return { accessToken, calendarId: updated.calendarId };
    } catch (err) {
      log.warn('GoogleSync', `Failed to refresh token for user ${userId}: ${(err as Error).message}`);
      return null;
    }
  }

  async onCreated(appt: Appointment, summary: string): Promise<void> {
    if (!appt.id) return;
    const ctx = await this.getTokenAndCalendar(appt.userId);
    if (!ctx) return;
    try {
      const event = await this.provider.createEvent(ctx.accessToken, ctx.calendarId, {
        summary,
        description: appt.notes ?? undefined,
        start: appt.startTime,
        end: appt.endTime,
        appointmentId: appt.id,
      });
      await this.appointmentRepo.update(appt.id, appt.userId, {
        googleEventId: event.id,
        googleCalendarId: ctx.calendarId,
        googleSyncedAt: new Date(),
      });
    } catch (err) {
      log.warn('GoogleSync', `Failed to create event for appointment ${appt.id}: ${(err as Error).message}`);
    }
  }

  async onUpdated(appt: Appointment, summary: string): Promise<void> {
    if (!appt.id) return;
    if (!appt.googleEventId) {
      // Was created before integration was active — try to push as new.
      return this.onCreated(appt, summary);
    }
    const ctx = await this.getTokenAndCalendar(appt.userId);
    if (!ctx) return;
    try {
      await this.provider.updateEvent(ctx.accessToken, ctx.calendarId, appt.googleEventId, {
        summary,
        description: appt.notes ?? undefined,
        start: appt.startTime,
        end: appt.endTime,
        appointmentId: appt.id,
      });
      await this.appointmentRepo.update(appt.id, appt.userId, { googleSyncedAt: new Date() });
    } catch (err) {
      log.warn('GoogleSync', `Failed to update event for appointment ${appt.id}: ${(err as Error).message}`);
    }
  }

  async onCanceled(appt: Appointment): Promise<void> {
    if (!appt.id || !appt.googleEventId) return;
    const ctx = await this.getTokenAndCalendar(appt.userId);
    if (!ctx) return;
    try {
      await this.provider.deleteEvent(ctx.accessToken, ctx.calendarId, appt.googleEventId);
      await this.appointmentRepo.update(appt.id, appt.userId, {
        googleEventId: null,
        googleSyncedAt: new Date(),
      });
    } catch (err) {
      log.warn('GoogleSync', `Failed to delete event for appointment ${appt.id}: ${(err as Error).message}`);
    }
  }
}
