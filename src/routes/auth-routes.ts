import { Router } from 'express';
import { AuthController } from '../adapters/controllers/auth-controller';
import { PrismaUserRepository } from '../infrastructure/db/prisma-user-repository';
import { RegisterUseCase } from '../application/use-cases/auth/register-use-case';
import { LoginUseCase } from '../application/use-cases/auth/login-use-case';
import { validate } from '../middlewares/validation/validate';
import { registerSchema, loginSchema } from '../middlewares/validation/schemas/auth-schemas';

const router = Router();

const repo = new PrismaUserRepository();
const registerUseCase = new RegisterUseCase(repo);
const loginUseCase = new LoginUseCase(repo);
const controller = new AuthController(registerUseCase, loginUseCase);

router.post('/register', validate(registerSchema), (req, res, next) => controller.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => controller.login(req, res, next));

export default router;
