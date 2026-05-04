import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';
import { validateId } from '../middlewares/validation/validate';

import { PrismaAppointmentRepository } from '../infrastructure/db/prisma-appointment-repository';
import { PrismaAvailabilityRepository } from '../infrastructure/db/prisma-availability-repository';
import { PrismaBlockedTimeRepository } from '../infrastructure/db/prisma-blocked-time-repository';

import { CreateAppointmentUseCase } from '../application/use-cases/appointment/create-appointment-use-case';
import { ListAppointmentsUseCase } from '../application/use-cases/appointment/list-appointments-use-case';
import { GetAppointmentUseCase } from '../application/use-cases/appointment/get-appointment-use-case';
import { UpdateAppointmentUseCase } from '../application/use-cases/appointment/update-appointment-use-case';
import { ChangeAppointmentStatusUseCase } from '../application/use-cases/appointment/change-appointment-status-use-case';
import { CancelAppointmentUseCase } from '../application/use-cases/appointment/cancel-appointment-use-case';
import { ListAvailableSlotsUseCase } from '../application/use-cases/appointment/list-available-slots-use-case';

import { AppointmentController } from '../adapters/controllers/appointment-controller';

const router = Router();

const apptRepo = new PrismaAppointmentRepository();
const blockedRepo = new PrismaBlockedTimeRepository();
const availabilityRepo = new PrismaAvailabilityRepository();

const createUC = new CreateAppointmentUseCase(apptRepo, blockedRepo);
const listUC = new ListAppointmentsUseCase(apptRepo);
const getUC = new GetAppointmentUseCase(apptRepo);
const updateUC = new UpdateAppointmentUseCase(apptRepo, blockedRepo);
const changeStatusUC = new ChangeAppointmentStatusUseCase(apptRepo);
const cancelUC = new CancelAppointmentUseCase(apptRepo);
const slotsUC = new ListAvailableSlotsUseCase(apptRepo, availabilityRepo, blockedRepo);

const controller = new AppointmentController(
  createUC, listUC, getUC, updateUC, changeStatusUC, cancelUC, slotsUC,
);

router.use(authMiddleware);
router.use(requirePlanFeature('agenda'));

router.get('/slots', (req, res, next) => controller.slots(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.get('/:id', validateId, (req, res, next) => controller.get(req, res, next));
router.patch('/:id', validateId, (req, res, next) => controller.update(req, res, next));
router.post('/:id/status', validateId, (req, res, next) => controller.changeStatus(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.cancel(req, res, next));

export default router;
