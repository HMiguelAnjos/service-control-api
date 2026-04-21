import { ClientPhoto } from '../../domain/entities/client-photo';

export interface IClientPhotoRepository {
  create(photo: ClientPhoto): Promise<ClientPhoto>;
  findByClient(clientId: number, userId: number): Promise<ClientPhoto[]>;
  findOne(id: number, userId: number): Promise<ClientPhoto | null>;
  delete(id: number, userId: number): Promise<void>;
}
