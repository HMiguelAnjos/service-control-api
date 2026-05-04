import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../../domain/entities/user';
import { IUserRepository } from '../../ports/iuser-repository';
import { ConflictError, ValidationError } from '../../../middlewares/errors/errors';
import { log } from '../../../config/logger';
import { PlanName } from '../../../domain/enums';

export class RegisterUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { name: string; email: string; password: string }) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      log.warn('Register', `Tentativa de cadastro com e-mail já existente: ${input.email}`);
      throw new ConflictError('E-mail já cadastrado', { field: 'email' });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const defaultPlanId = await this.repo.findPlanIdByName(PlanName.Professional);
    const entity = new User(undefined, input.name, input.email, passwordHash,
      new Date(), new Date(), null, null, undefined, defaultPlanId);

    if (!entity.isValid()) {
      log.warn('Register', `Dados inválidos para cadastro: ${input.email}`);
      throw new ValidationError('Dados de cadastro inválidos');
    }

    const created = await this.repo.create(entity);

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const token = jwt.sign(
      { id: created.id, email: created.email, role: created.role, planId: created.planId, isActive: created.isActive },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
    );

    log.success('Register', `Novo usuário criado: ${input.email} (plano: ${PlanName.Professional})`);

    return {
      token,
      user: { id: created.id, name: created.name, email: created.email, role: created.role, planId: created.planId },
    };
  }
}
