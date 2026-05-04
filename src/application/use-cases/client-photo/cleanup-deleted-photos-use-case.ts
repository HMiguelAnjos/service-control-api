import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import { IStorageService } from '../../ports/istorage-service';
import { log } from '../../../config/logger';

export interface CleanupResult {
  scanned: number;
  storageDeleted: number;
  rowsDeleted: number;
}

const DEFAULT_RETENTION_DAYS = 30;

/**
 * Permanently removes photo objects + DB rows for entries soft-deleted
 * longer than `retentionDays` ago. Safe to call repeatedly (idempotent).
 */
export class CleanupDeletedPhotosUseCase {
  constructor(
    private repo: IClientPhotoRepository,
    private storage: IStorageService,
  ) {}

  async execute(retentionDays = DEFAULT_RETENTION_DAYS): Promise<CleanupResult> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const candidates = await this.repo.findSoftDeletedBefore(cutoff);

    let storageDeleted = 0;
    let rowsDeleted = 0;

    for (const photo of candidates) {
      const keys = [photo.bucketKey, photo.thumbKey].filter(
        (k): k is string => typeof k === 'string' && k.length > 0,
      );
      if (keys.length > 0) {
        try {
          await this.storage.delete(keys);
          storageDeleted += keys.length;
        } catch (err) {
          log.warn(
            'CleanupPhotos',
            `Failed to delete storage keys for photo ${photo.id}: ${(err as Error).message}`,
          );
          continue;
        }
      }

      if (photo.id !== undefined) {
        await this.repo.hardDelete(photo.id);
        rowsDeleted += 1;
      }
    }

    return { scanned: candidates.length, storageDeleted, rowsDeleted };
  }
}
