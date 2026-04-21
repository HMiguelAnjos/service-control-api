import { ClientPhoto } from '../../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';

export class UploadClientPhotoUseCase {
  constructor(private repo: IClientPhotoRepository) {}

  async execute(input: {
    userId: number;
    clientId: number;
    filename: string;
    takenAt: Date;
  }): Promise<ClientPhoto> {
    const photo = new ClientPhoto(
      undefined,
      input.userId,
      input.clientId,
      input.filename,
      input.takenAt,
    );
    return this.repo.create(photo);
  }
}
