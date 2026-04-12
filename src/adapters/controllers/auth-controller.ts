import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/register-use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login-use-case';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
  ) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
