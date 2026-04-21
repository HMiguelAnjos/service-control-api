import { ClientPhoto } from '../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../application/ports/iclient-photo-repository';
import prisma from './prisma';

function toEntity(r: any): ClientPhoto {
  return new ClientPhoto(r.id, r.userId, r.clientId, r.filename, r.takenAt, r.createdAt);
}

export class PrismaClientPhotoRepository implements IClientPhotoRepository {
  async create(photo: ClientPhoto): Promise<ClientPhoto> {
    const created = await prisma.client_photo.create({
      data: {
        userId: photo.userId,
        clientId: photo.clientId,
        filename: photo.filename,
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
    const row = await prisma.client_photo.findFirst({ where: { id, userId, deletedAt: null } });
    return row ? toEntity(row) : null;
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.client_photo.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
