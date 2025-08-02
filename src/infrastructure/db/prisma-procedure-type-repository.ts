import { PrismaClient } from '@prisma/client';
import { ProcedureType } from '../../domain/entities/procedure-type';
import { IProcedureTypeRepository } from '../../domain/repositories/iprocedure-type-repository';

const prisma = new PrismaClient();

export class PrismaProcedureTypeRepository implements IProcedureTypeRepository {
  async create(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.create({
      data: {
        name: procedureType.name,
        description: procedureType.description,
      },
    });
  }

  async findAll(): Promise<ProcedureType[]> {
    const rawProcedureTypes = await prisma.procedure_type.findMany({
      where: { deletedAt: null },
    });
    return rawProcedureTypes.map(
      (p: any) =>
        new ProcedureType(
          p.id,
          p.name,
          p.description ?? undefined,
        )
    );
  }

  async update(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.update({
      where: { id: procedureType.id },
      data: {
        name: procedureType.name,
        description: procedureType.description,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.procedure_type.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      } as any,
    });
  }

  async findOne(id: number): Promise<ProcedureType | null> {
    const raw = await prisma.procedure_type.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new ProcedureType(
      raw.id,
      raw.name,
      raw.description ?? undefined,
    );
  }
}
