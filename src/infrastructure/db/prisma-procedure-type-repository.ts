import { ProcedureType } from '../../domain/entities/procedure-type';
import { IProcedureTypeRepository } from '../../application/ports/iprocedure-type-repository';
import prisma from './prisma';

export class PrismaProcedureTypeRepository implements IProcedureTypeRepository {
  async create(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.create({
      data: {
        userId: procedureType.userId,
        name: procedureType.name,
        description: procedureType.description,
      },
    });
  }

  async findAll(userId: number): Promise<ProcedureType[]> {
    const rawProcedureTypes = await prisma.procedure_type.findMany({
      where: { userId, deletedAt: null },
    });
    return rawProcedureTypes.map(
      (p) => new ProcedureType(p.id, p.userId, p.name, p.description ?? undefined),
    );
  }

  async findOne(id: number, userId: number): Promise<ProcedureType | null> {
    const raw = await prisma.procedure_type.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!raw) return null;
    return new ProcedureType(raw.id, raw.userId, raw.name, raw.description ?? undefined);
  }

  async update(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.updateMany({
      where: { id: procedureType.id, userId: procedureType.userId, deletedAt: null },
      data: {
        name: procedureType.name,
        description: procedureType.description,
      },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.procedure_type.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
