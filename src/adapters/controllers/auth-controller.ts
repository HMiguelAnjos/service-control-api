import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/register-use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login-use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/auth/forgot-password-use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/reset-password-use-case';

export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await this.forgotPasswordUseCase.execute(req.body);
      // Sempre responde 200 para não revelar se o e-mail existe
      return res.json({ message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await this.resetPasswordUseCase.execute(req.body);
      return res.json({ message: 'Senha redefinida com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}
