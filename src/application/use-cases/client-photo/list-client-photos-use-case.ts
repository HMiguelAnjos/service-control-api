import { ClientPhoto } from '../../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';

export class ListClientPhotosUseCase {
  constructor(private repo: IClientPhotoRepository) {}

  async execute(clientId: number, userId: number): Promise<ClientPhoto[]> {
    return this.repo.findByClient(clientId, userId);
  }
}
