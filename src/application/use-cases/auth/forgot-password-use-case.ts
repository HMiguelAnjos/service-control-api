import crypto from 'crypto';
import { IUserRepository } from '../../ports/iuser-repository';
import { sendPasswordResetEmail } from '../../../config/email';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export class ForgotPasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { email: string }): Promise<void> {
    const user = await this.repo.findByEmail(input.email);

    // Não revelamos se o e-mail existe ou não (segurança)
    if (!user || !user.id) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TOKEN_TTL_MS);

    await this.repo.updateResetToken(user.id, token, expires);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(user.email, resetLink);
  }
}
