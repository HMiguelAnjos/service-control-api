import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../ports/iuser-repository';
import { ForbiddenError, UnauthorizedError } from '../../../middlewares/errors/errors';
import { log } from '../../../config/logger';
import prisma from '../../../infrastructure/db/prisma';

export class LoginUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      log.warn('Login', `Tentativa com e-mail não cadastrado: ${input.email}`);
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    if (!user.isActive) {
      log.warn('Login', `Tentativa de login em conta desativada: ${input.email}`);
      throw new ForbiddenError('Conta desativada. Entre em contato com o suporte.');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      log.warn('Login', `Senha incorreta para: ${input.email}`);
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, planId: user.planId, isActive: user.isActive },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
    );

    // Fetch plan details to return to the frontend
    const plan = user.planId
      ? await prisma.plan.findUnique({
          where: { id: user.planId },
          select: { id: true, name: true, price: true, features: true },
        })
      : null;

    log.success('Login', `Usuário autenticado: ${input.email} (role: ${user.role})`);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        planId: user.planId,
        isActive: user.isActive,
        plan,
      },
    };
  }
}
