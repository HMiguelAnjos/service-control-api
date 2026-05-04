import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';

import { GoogleCalendarProvider } from '../infrastructure/calendar/google-calendar-provider';
import { PrismaCalendarIntegrationRepository } from '../infrastructure/db/prisma-calendar-integration-repository';

import { GetGoogleAuthUrlUseCase } from '../application/use-cases/calendar/get-google-auth-url-use-case';
import { HandleGoogleCallbackUseCase } from '../application/use-cases/calendar/handle-google-callback-use-case';
import { DisconnectGoogleUseCase } from '../application/use-cases/calendar/disconnect-google-use-case';
import { GetIntegrationStatusUseCase } from '../application/use-cases/calendar/get-integration-status-use-case';
import { ListGoogleEventsUseCase } from '../application/use-cases/calendar/list-google-events-use-case';

import { CalendarController } from '../adapters/controllers/calendar-controller';

const router = Router();

const provider = new GoogleCalendarProvider();
const integrationRepo = new PrismaCalendarIntegrationRepository();

const controller = new CalendarController(
  new GetGoogleAuthUrlUseCase(provider),
  new HandleGoogleCallbackUseCase(provider, integrationRepo),
  new DisconnectGoogleUseCase(provider, integrationRepo),
  new GetIntegrationStatusUseCase(integrationRepo),
  new ListGoogleEventsUseCase(provider, integrationRepo),
);

// Public callback — Google redirects the browser here, no auth header.
router.get('/auth/google/callback', (req, res, next) => controller.handleCallback(req, res, next));

// Authenticated + plan-gated.
router.use(authMiddleware);
router.use(requirePlanFeature('agenda'));

router.get('/auth/google/url', (req, res, next) => controller.getAuthUrl(req, res, next));
router.get('/integration', (req, res, next) => controller.status(req, res, next));
router.delete('/integration', (req, res, next) => controller.disconnect(req, res, next));
router.get('/google/events', (req, res, next) => controller.listEvents(req, res, next));

export default router;
