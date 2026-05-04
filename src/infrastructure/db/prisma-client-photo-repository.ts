import { ClientPhoto } from '../../domain/entities/client-photo';
import {
  IClientPhotoRepository,
  UpdateClientPhotoInput,
} from '../../application/ports/iclient-photo-repository';
import prisma from './prisma';

function toEntity(r: any): ClientPhoto {
  return new ClientPhoto({
    id: r.id,
    userId: r.userId,
    clientId: r.clientId,
    bucketKey: r.bucketKey,
    thumbKey: r.thumbKey,
    filename: r.filename,
    mimeType: r.mimeType,
    sizeBytes: r.sizeBytes,
    width: r.width,
    height: r.height,
    tag: r.tag,
    notes: r.notes,
    takenAt: r.takenAt,
    createdAt: r.createdAt,
    deletedAt: r.deletedAt,
  });
}

export class PrismaClientPhotoRepository implements IClientPhotoRepository {
  async create(photo: ClientPhoto): Promise<ClientPhoto> {
    const created = await prisma.client_photo.create({
      data: {
        userId: photo.userId,
        clientId: photo.clientId,
        bucketKey: photo.bucketKey,
        thumbKey: photo.thumbKey,
        filename: photo.filename,
        mimeType: photo.mimeType,
        sizeBytes: photo.sizeBytes,
        width: photo.width,
        height: photo.height,
        tag: photo.tag,
        notes: photo.notes,
        takenAt: photo.takenAt,
      },
    });
    return toEntity(created);
  }

  async findByClient(clientId: number, userId: number): Promise<ClientPhoto[]> {
    const rows = await prisma.client_photo.findMany({
      where: { clientId, userId, deletedAt: null },
      orderBy: { takenAt: 'desc' },
    });
    return rows.map(toEntity);
  }

  async findOne(id: number, userId: number): Promise<ClientPhoto | null> {
    const row = await prisma.client_photo.findFirst({
      where: { id, userId, deletedAt: null },
    });
    return row ? toEntity(row) : null;
  }

  async update(
    id: number,
    userId: number,
    input: UpdateClientPhotoInput,
  ): Promise<ClientPhoto | null> {
    const result = await prisma.client_photo.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        ...(input.tag !== undefined ? { tag: input.tag } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.takenAt !== undefined ? { takenAt: input.takenAt } : {}),
      },
    });
    if (result.count === 0) return null;
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.client_photo.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async findSoftDeletedBefore(cutoff: Date): Promise<ClientPhoto[]> {
    const rows = await prisma.client_photo.findMany({
      where: { deletedAt: { lt: cutoff, not: null } },
    });
    return rows.map(toEntity);
  }

  async hardDelete(id: number): Promise<void> {
    await prisma.client_photo.delete({ where: { id } });
  }
}
