import { ClientPhoto } from '../../domain/entities/client-photo';

export interface UpdateClientPhotoInput {
  tag?: string | null;
  notes?: string | null;
  takenAt?: Date;
}

export interface IClientPhotoRepository {
  create(photo: ClientPhoto): Promise<ClientPhoto>;
  findByClient(clientId: number, userId: number): Promise<ClientPhoto[]>;
  findOne(id: number, userId: number): Promise<ClientPhoto | null>;
  update(id: number, userId: number, input: UpdateClientPhotoInput): Promise<ClientPhoto | null>;
  delete(id: number, userId: number): Promise<void>;
  findSoftDeletedBefore(cutoff: Date): Promise<ClientPhoto[]>;
  hardDelete(id: number): Promise<void>;
}
