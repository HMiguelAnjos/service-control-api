import { Business } from '../../domain/entities/business';
import {
  IBusinessRepository,
  UpdateBusinessInput,
} from '../../application/ports/ibusiness-repository';
import prisma from './prisma';

function toEntity(r: any): Business {
  return new Business({
    id: r.id,
    name: r.name,
    displayName: r.displayName,
    monthlyServiceEstimate: r.monthlyServiceEstimate,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    deletedAt: r.deletedAt,
  });
}

export class PrismaBusinessRepository implements IBusinessRepository {
  async findById(id: number): Promise<Business | null> {
    const r = await prisma.business.findFirst({ where: { id, deletedAt: null } });
    return r ? toEntity(r) : null;
  }

  async update(id: number, patch: UpdateBusinessInput): Promise<Business> {
    const updated = await prisma.business.update({
      where: { id },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
        ...(patch.monthlyServiceEstimate !== undefined
          ? { monthlyServiceEstimate: patch.monthlyServiceEstimate }
          : {}),
      },
    });
    return toEntity(updated);
  }
}
