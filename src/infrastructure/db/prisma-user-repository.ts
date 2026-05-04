import { User } from '../../domain/entities/user';
import { IUserRepository } from '../../application/ports/iuser-repository';
import prisma from './prisma';

function toUser(raw: any): User {
  return new User(
    raw.id,
    raw.name,
    raw.email,
    raw.passwordHash,
    raw.createdAt,
    raw.updatedAt,
    raw.resetToken,
    raw.resetTokenExpires,
    raw.role ?? 'user',
    raw.planId ?? null,
    raw.isActive ?? true,
  );
}

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const raw = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        ...(user.planId != null ? { planId: user.planId } : {}),
      },
    });
    return toUser(raw);
  }

  async findPlanIdByName(name: string): Promise<number | null> {
    const plan = await prisma.plan.findUnique({ where: { name }, select: { id: true } });
    return plan?.id ?? null;
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

  // ── Admin methods ─────────────────────────────────────────

  async findAll(): Promise<any[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        planId: true,
        isActive: true,
        createdAt: true,
        plan: { select: { id: true, name: true, price: true, features: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updatePlan(id: number, planId: number | null): Promise<void> {
    await prisma.user.update({ where: { id }, data: { planId } });
  }

  async updateRole(id: number, role: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { role } });
  }

  async updateActive(id: number, isActive: boolean): Promise<void> {
    await prisma.user.update({ where: { id }, data: { isActive } });
  }
}
