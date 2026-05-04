import { Client } from '../../domain/entities/client';
import { IClientRepository } from '../../application/ports/iclient-repository';
import { Page, PaginationParams, buildPage } from '../../application/utils/pagination';
import prisma from './prisma';

function toEntity(c: { id: number; userId: number; name: string; phone: string | null; email: string | null }): Client {
  return new Client(c.id, c.userId, c.name, c.phone ?? undefined, c.email ?? undefined);
}

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
      orderBy: { id: 'desc' },
    });
    return rawClients.map(toEntity);
  }

  async findPage(userId: number, params: PaginationParams): Promise<Page<Client>> {
    const rows = await prisma.client.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      },
      orderBy: { id: 'desc' },
      take: params.limit + 1,
    });
    return buildPage(rows, params.limit, (r) => r.id, toEntity);
  }

  async findOne(id: number, userId: number): Promise<Client | null> {
    const raw = await prisma.client.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return raw ? toEntity(raw) : null;
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
