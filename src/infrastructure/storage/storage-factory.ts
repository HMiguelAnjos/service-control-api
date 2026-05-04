import { IStorageService } from '../../application/ports/istorage-service';
import { R2StorageService } from './r2-storage-service';
import { LocalStorageService } from './local-storage-service';
import { log } from '../../config/logger';

let instance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (instance) return instance;

  const hasR2 =
    !!process.env.R2_ENDPOINT &&
    !!process.env.R2_BUCKET &&
    !!process.env.R2_ACCESS_KEY_ID &&
    !!process.env.R2_SECRET_ACCESS_KEY;

  if (hasR2) {
    log.info('Storage', 'Using Cloudflare R2');
    instance = new R2StorageService();
  } else {
    log.warn('Storage', 'R2 not configured — falling back to local disk storage');
    instance = new LocalStorageService();
  }

  return instance;
}
