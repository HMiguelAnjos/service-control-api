import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { adminMiddleware } from '../middlewares/auth/admin-middleware';
import { AdminController } from '../adapters/controllers/admin-controller';
import { validateId } from '../middlewares/validation/validate';

const router = Router();
const controller = new AdminController();

router.use(authMiddleware);
router.use(adminMiddleware);

// ── Plans ──────────────────────────────────────────────────
router.get('/plans', (req, res, next) => controller.listPlans(req, res, next));

// ── Users ──────────────────────────────────────────────────
router.get('/users', (req, res, next) => controller.listUsers(req, res, next));
router.put('/users/:id/plan', validateId, (req, res, next) => controller.updateUserPlan(req, res, next));
router.put('/users/:id/role', validateId, (req, res, next) => controller.updateUserRole(req, res, next));
router.put('/users/:id/active', validateId, (req, res, next) => controller.updateUserActive(req, res, next));

// ── Maintenance ────────────────────────────────────────────
router.post('/maintenance/cleanup-photos', (req, res, next) => controller.cleanupPhotos(req, res, next));

export default router;
