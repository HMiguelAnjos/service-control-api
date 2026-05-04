import { Service, ServiceProcedureInput } from '../../domain/entities/service';
import { IServiceRepository } from '../../application/ports/iservice-repository';
import { Page, PaginationParams, buildPage } from '../../application/utils/pagination';
import prisma from './prisma';

function toEntity(s: any): Service {
  const procedures: ServiceProcedureInput[] = (s.procedures ?? []).map((p: any) => ({
    procedureTypeId: p.procedureTypeId,
    price: Number(p.price),
    id: p.id,
    procedureType: p.procedureType,
  }));
  return new Service(s.id, s.userId, s.clientId, Number(s.totalPrice), s.date, s.description ?? undefined, procedures);
}

const procedureInclude = {
  include: {
    procedures: {
      include: { procedureType: true },
    },
    client: true,
  },
};

export class PrismaServiceRepository implements IServiceRepository {
  async create(service: Service): Promise<Service> {
    const raw = await prisma.service.create({
      data: {
        userId: service.userId,
        clientId: service.clientId,
        description: service.description,
        totalPrice: service.totalPrice,
        date: service.date,
        procedures: {
          create: (service.procedures ?? []).map((p) => ({
            procedureTypeId: p.procedureTypeId,
            price: p.price,
          })),
        },
      },
      ...procedureInclude,
    });
    return toEntity(raw);
  }

  async findAll(userId: number): Promise<Service[]> {
    const rows = await prisma.service.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      ...procedureInclude,
    });
    return rows.map(toEntity);
  }

  async findPage(userId: number, params: PaginationParams): Promise<Page<Service>> {
    const rows = await prisma.service.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(params.cursor ? { id: { lt: params.cursor } } : {}),
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: params.limit + 1,
      ...procedureInclude,
    });
    return buildPage(rows, params.limit, (r) => r.id, toEntity);
  }

  async findOne(id: number, userId: number): Promise<Service | null> {
    const raw = await prisma.service.findFirst({
      where: { id, userId, deletedAt: null },
      ...procedureInclude,
    });
    return raw ? toEntity(raw) : null;
  }

  async findByClient(clientId: number, userId: number): Promise<Service[]> {
    const rows = await prisma.service.findMany({
      where: { clientId, userId, deletedAt: null },
      ...procedureInclude,
    });
    return rows.map(toEntity);
  }

  async update(service: Service): Promise<void> {
    // Remove existing procedures and recreate
    await prisma.service_procedure.deleteMany({ where: { serviceId: service.id } });
    await prisma.service.updateMany({
      where: { id: service.id, userId: service.userId, deletedAt: null },
      data: { clientId: service.clientId, description: service.description, totalPrice: service.totalPrice, date: service.date },
    });
    if (service.procedures?.length) {
      await prisma.service_procedure.createMany({
        data: service.procedures.map((p) => ({ serviceId: service.id!, procedureTypeId: p.procedureTypeId, price: p.price })),
      });
    }
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.service.updateMany({ where: { id, userId, deletedAt: null }, data: { deletedAt: new Date() } });
  }
}
