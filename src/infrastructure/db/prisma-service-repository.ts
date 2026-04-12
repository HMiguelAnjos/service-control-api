import { Service } from '../../domain/entities/service';
import { IServiceRepository } from '../../application/ports/iservice-repository';
import prisma from './prisma';

export class PrismaServiceRepository implements IServiceRepository {
  async create(service: Service): Promise<Service> {
    const raw = await prisma.service.create({
      data: {
        userId: service.userId,
        clientId: service.clientId,
        procedureId: service.procedureId,
        description: service.description,
        price: service.price,
        date: service.date,
      },
    });
    return new Service(raw.id, raw.userId, raw.clientId, raw.procedureId, raw.price.toNumber(), raw.date, raw.description ?? undefined);
  }

  async findAll(userId: number): Promise<Service[]> {
    const rawServices = await prisma.service.findMany({
      where: { userId, deletedAt: null },
    });
    return rawServices.map(
      (s) =>
        new Service(
          s.id,
          s.userId,
          s.clientId,
          s.procedureId,
          s.price.toNumber(),
          s.date,
          s.description ?? undefined,
        ),
    );
  }

  async findOne(id: number, userId: number): Promise<Service | null> {
    const raw = await prisma.service.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!raw) return null;
    return new Service(
      raw.id,
      raw.userId,
      raw.clientId,
      raw.procedureId,
      raw.price.toNumber(),
      raw.date,
      raw.description ?? undefined,
    );
  }

  async update(service: Service): Promise<void> {
    await prisma.service.updateMany({
      where: { id: service.id, userId: service.userId, deletedAt: null },
      data: {
        clientId: service.clientId,
        procedureId: service.procedureId,
        description: service.description,
        price: service.price,
        date: service.date,
      },
    });
  }

  async findByClient(clientId: number, userId: number): Promise<Service[]> {
    const raw = await prisma.service.findMany({
      where: { clientId, userId, deletedAt: null },
    });
    return raw.map(
      (s) => new Service(s.id, s.userId, s.clientId, s.procedureId, s.price.toNumber(), s.date, s.description ?? undefined),
    );
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.service.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
