import fs from 'fs';
import path from 'path';
import { IStorageService, UploadInput } from '../../application/ports/istorage-service';

/**
 * Disk-based fallback for local development.
 * Files served by Express static handler at /uploads/<key>.
 */
export class LocalStorageService implements IStorageService {
  private readonly root: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.root = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');
    const port = process.env.PORT ?? '3000';
    this.publicBaseUrl = (
      process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`
    ).replace(/\/$/, '');
  }

  async upload(input: UploadInput): Promise<void> {
    const fullPath = path.join(this.root, input.key);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, input.body);
  }

  async delete(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        const fullPath = path.join(this.root, key);
        try {
          await fs.promises.unlink(fullPath);
        } catch {
          /* ignore — already gone */
        }
      }),
    );
  }

  async getSignedUrl(key: string): Promise<string> {
    return `${this.publicBaseUrl}/uploads/${key}`;
  }
}
