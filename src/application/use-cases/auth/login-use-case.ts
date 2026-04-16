import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../ports/iuser-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';
import { log } from '../../../config/logger';

export class LoginUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      log.warn('Login', `Tentativa com e-mail não cadastrado: ${input.email}`);
      throw new BadRequest(401, 'E-mail ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      log.warn('Login', `Senha incorreta para: ${input.email}`);
      throw new BadRequest(401, 'E-mail ou senha inválidos');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    } as jwt.SignOptions);

    log.success('Login', `Usuário autenticado: ${input.email}`);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  }
}
