import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../application/ports/iuser-repository';
import prisma from './prisma';

function toUser(raw: {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  resetToken: string | null;
  resetTokenExpires: Date | null;
}): User {
  return new User(
    raw.id,
    raw.name,
    raw.email,
    raw.passwordHash,
    raw.createdAt,
    raw.updatedAt,
    raw.resetToken,
    raw.resetTokenExpires,
  );
}

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const raw = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      },
    });
    return toUser(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return toUser(raw);
  }

  async findById(id: number): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return toUser(raw);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!raw) return null;
    return toUser(raw);
  }

  async updateResetToken(id: number, token: string | null, expires: Date | null): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { resetToken: token, resetTokenExpires: expires },
    });
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null },
    });
  }
}
