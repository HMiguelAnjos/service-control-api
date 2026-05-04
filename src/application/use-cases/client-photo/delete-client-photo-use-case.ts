import fs from 'fs';
import path from 'path';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import { IStorageService } from '../../ports/istorage-service';

export class DeleteClientPhotoUseCase {
  constructor(
    private repo: IClientPhotoRepository,
    private storage: IStorageService,
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    const photo = await this.repo.findOne(id, userId);
    if (!photo) return;

    const keys = [photo.bucketKey, photo.thumbKey].filter(
      (k): k is string => typeof k === 'string' && k.length > 0,
    );
    if (keys.length > 0) {
      try {
        await this.storage.delete(keys);
      } catch {
        /* keep going — DB soft-delete still happens, cleanup job will retry */
      }
    }

    if (photo.filename) {
      const root = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
      const legacyPath = path.join(root, 'client-photos', photo.filename);
      try {
        if (fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
      } catch {
        /* ignore */
      }
    }

    await this.repo.delete(id, userId);
  }
}
