import { Client } from '../../domain/entities/client';
import { IClientRepository } from '../../application/ports/iclient-repository';
import prisma from './prisma';

export class PrismaClientRepository implements IClientRepository {
  async create(client: Client): Promise<void> {
    await prisma.client.create({
      data: {
        userId: client.userId,
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  }

  async findAll(userId: number): Promise<Client[]> {
    const rawClients = await prisma.client.findMany({
      where: { userId, deletedAt: null },
    });
    return rawClients.map(
      (c) => new Client(c.id, c.userId, c.name, c.phone ?? undefined, c.email ?? undefined),
    );
  }

  async findOne(id: number, userId: number): Promise<Client | null> {
    const raw = await prisma.client.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!raw) return null;
    return new Client(raw.id, raw.userId, raw.name, raw.phone ?? undefined, raw.email ?? undefined);
  }

  async update(client: Client): Promise<void> {
    await prisma.client.updateMany({
      where: { id: client.id, userId: client.userId, deletedAt: null },
      data: {
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.client.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
