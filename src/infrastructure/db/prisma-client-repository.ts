import { PrismaClient } from '@prisma/client';
import { Client } from '../../domain/entities/client';
import { IClientRepository } from '../../domain/repositories/iclient-repository';

const prisma = new PrismaClient();

export class PrismaClientRepository implements IClientRepository {
  async create(client: Client): Promise<void> {
    await prisma.client.create({
      data: {
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  }

  async findAll(): Promise<Client[]> {
    const rawClients = await prisma.client.findMany();
    return rawClients.map(
      (c) =>
        new Client(
          c.id,
          c.name,
          c.phone ?? undefined,
          c.email ?? undefined,
        )
    );
  }

  async update(client: Client): Promise<void> {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Client | null> {
    const raw = await prisma.client.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new Client(
      raw.id,
      raw.name,
      raw.phone ?? undefined,
      raw.email ?? undefined,
      raw.createdAt
    );
  }
}
