import crypto from 'crypto';
import { IUserRepository } from '../../ports/iuser-repository';
import { sendPasswordResetEmail } from '../../../config/email';
import { log } from '../../../config/logger';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export class ForgotPasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { email: string }): Promise<void> {
    const user = await this.repo.findByEmail(input.email);

    if (!user || !user.id) {
      // Não revelamos se o e-mail existe (segurança)
      log.info('ForgotPassword', `Solicitação para e-mail não cadastrado: ${input.email}`);
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TOKEN_TTL_MS);

    await this.repo.updateResetToken(user.id, token, expires);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
      log.success('ForgotPassword', `E-mail de recuperação enviado para: ${input.email}`);
    } catch (err) {
      log.error('ForgotPassword', `Falha ao enviar e-mail para: ${input.email}`, err);
    }
  }
}
