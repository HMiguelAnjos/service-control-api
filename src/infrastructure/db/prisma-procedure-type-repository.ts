import { ProcedureType } from '../../domain/entities/procedure-type';
import { IProcedureTypeRepository } from '../../application/ports/iprocedure-type-repository';
import prisma from './prisma';

function toEntity(p: {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  costValue: any;
  finalValue: any;
  defaultDurationMinutes: number | null;
  expectedIntervalDays: number | null;
}): ProcedureType {
  return new ProcedureType(
    p.id,
    p.userId,
    p.name,
    p.description ?? undefined,
    p.costValue != null ? Number(p.costValue) : undefined,
    p.finalValue != null ? Number(p.finalValue) : undefined,
    p.defaultDurationMinutes,
    p.expectedIntervalDays,
  );
}

export class PrismaProcedureTypeRepository implements IProcedureTypeRepository {
  async create(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.create({
      data: {
        userId: procedureType.userId,
        name: procedureType.name,
        description: procedureType.description,
        costValue: procedureType.costValue,
        finalValue: procedureType.finalValue,
        defaultDurationMinutes: procedureType.defaultDurationMinutes ?? undefined,
        expectedIntervalDays: procedureType.expectedIntervalDays ?? undefined,
      },
    });
  }

  async findAll(userId: number): Promise<ProcedureType[]> {
    const rows = await prisma.procedure_type.findMany({
      where: { userId, deletedAt: null },
    });
    return rows.map(toEntity);
  }

  async findOne(id: number, userId: number): Promise<ProcedureType | null> {
    const raw = await prisma.procedure_type.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!raw) return null;
    return toEntity(raw);
  }

  async update(procedureType: ProcedureType): Promise<void> {
    await prisma.procedure_type.updateMany({
      where: { id: procedureType.id, userId: procedureType.userId, deletedAt: null },
      data: {
        name: procedureType.name,
        description: procedureType.description,
        costValue: procedureType.costValue ?? null,
        finalValue: procedureType.finalValue ?? null,
        defaultDurationMinutes: procedureType.defaultDurationMinutes ?? null,
        expectedIntervalDays: procedureType.expectedIntervalDays ?? null,
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
