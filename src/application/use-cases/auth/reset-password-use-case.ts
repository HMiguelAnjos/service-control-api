import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../ports/iuser-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';
import { log } from '../../../config/logger';

export class ResetPasswordUseCase {
  constructor(private repo: IUserRepository) {}

  async execute(input: { token: string; password: string }): Promise<void> {
    const user = await this.repo.findByResetToken(input.token);

    if (!user || !user.id) {
      log.warn('ResetPassword', 'Tentativa com token inválido');
      throw new BadRequest(400, 'Token inválido ou expirado');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      log.warn('ResetPassword', `Token expirado para usuário: ${user.email}`);
      throw new BadRequest(400, 'Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    await this.repo.updatePassword(user.id, passwordHash);

    log.success('ResetPassword', `Senha redefinida com sucesso para: ${user.email}`);
  }
}
