import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../application/ports/iuser-repository';
import prisma from './prisma';

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const raw = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      },
    });
    return new User(raw.id, raw.name, raw.email, raw.passwordHash);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return new User(raw.id, raw.name, raw.email, raw.passwordHash);
  }

  async findById(id: number): Promise<User | null> {
    const raw = await prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return new User(raw.id, raw.name, raw.email, raw.passwordHash);
  }
}
