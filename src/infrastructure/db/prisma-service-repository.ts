import { PrismaClient } from '@prisma/client';
import { Service } from '../../domain/entities/service';
import { IServiceRepository } from '../../domain/repositories/iservice-repository';

const prisma = new PrismaClient();

export class PrismaServiceRepository implements IServiceRepository {
  async create(service: Service): Promise<void> {
    await prisma.service.create({
      data: {
        clientId: service.clientId,
        procedureId: service.procedureId,
        description: service.description,
        price: service.price,
        date: service.date,
      },
    });
  }

  async findAll(): Promise<Service[]> {
    const rawServices = await prisma.service.findMany({
      where: { deletedAt: null },
    });
    return rawServices.map(
      (s: any) =>
        new Service(
          s.id,
          s.clientId,
          s.procedureId,
          s.price.toNumber(),
          s.date,
          s.description ?? undefined,
        )
    );
  }

  async update(service: Service): Promise<void> {
    await prisma.service.update({
      where: { id: service.id },
      data: {
        clientId: service.clientId,
        procedureId: service.procedureId,
        description: service.description,
        price: service.price,
        date: service.date,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.service.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<Service | null> {
    const raw = await prisma.service.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new Service(
      raw.id,
      raw.clientId,
      raw.procedureId,
      raw.price.toNumber(),
      raw.date,
      raw.description ?? undefined,
    );
  }
}
