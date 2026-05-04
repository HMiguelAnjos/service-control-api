import { NextFunction, Request, Response } from 'express';
import { GetGoogleAuthUrlUseCase } from '../../application/use-cases/calendar/get-google-auth-url-use-case';
import { HandleGoogleCallbackUseCase } from '../../application/use-cases/calendar/handle-google-callback-use-case';
import { DisconnectGoogleUseCase } from '../../application/use-cases/calendar/disconnect-google-use-case';
import { GetIntegrationStatusUseCase } from '../../application/use-cases/calendar/get-integration-status-use-case';
import { ListGoogleEventsUseCase } from '../../application/use-cases/calendar/list-google-events-use-case';
import { ValidationError } from '../../middlewares/errors/errors';

function parseDate(input: unknown, field: string): Date {
  if (typeof input !== 'string') throw new ValidationError(`${field} é obrigatório.`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}

export class CalendarController {
  constructor(
    private getAuthUrlUC: GetGoogleAuthUrlUseCase,
    private handleCallbackUC: HandleGoogleCallbackUseCase,
    private disconnectUC: DisconnectGoogleUseCase,
    private statusUC: GetIntegrationStatusUseCase,
    private listEventsUC: ListGoogleEventsUseCase,
  ) {}

  async getAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { url } = this.getAuthUrlUC.execute(userId);
      return res.json({ url });
    } catch (err) { next(err); }
  }

  /**
   * Public callback hit by Google redirect.  No auth — `state` carries the
   * userId.  After persisting tokens we redirect the browser to the front so
   * the user lands on the agenda page already connected.
   */
  async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.query.code ?? '');
      const state = String(req.query.state ?? '');
      const error = req.query.error;
      if (error) {
        return res.redirect(
          `${process.env.FRONTEND_AGENDA_URL ?? '/'}?google=error&reason=${encodeURIComponent(String(error))}`,
        );
      }
      if (!code || !state) throw new ValidationError('Parâmetros code/state ausentes.');
      await this.handleCallbackUC.execute({ code, state });
      return res.redirect(`${process.env.FRONTEND_AGENDA_URL ?? '/'}?google=connected`);
    } catch (err) { next(err); }
  }

  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await this.disconnectUC.execute(userId);
      return res.status(204).send();
    } catch (err) { next(err); }
  }

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const status = await this.statusUC.execute(userId);
      return res.json(status);
    } catch (err) { next(err); }
  }

  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const from = parseDate(req.query.from, 'from');
      const to = parseDate(req.query.to, 'to');
      const events = await this.listEventsUC.execute(userId, { from, to });
      return res.json(events.map(e => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
        status: e.status,
        htmlLink: e.htmlLink,
        source: e.source ?? 'external',
      })));
    } catch (err) { next(err); }
  }
}
