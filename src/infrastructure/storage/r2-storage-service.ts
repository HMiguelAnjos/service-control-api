import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, UploadInput } from '../../application/ports/istorage-service';

/**
 * Cloudflare R2 (S3-compatible) storage adapter.
 *
 * Why R2: zero egress fees, 10 GB free tier, S3 SDK compatible.
 *
 * Required env:
 *   R2_ENDPOINT          e.g. https://<account-id>.r2.cloudflarestorage.com
 *   R2_BUCKET            bucket name
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_PUBLIC_BASE_URL   (optional) custom domain to skip presigning
 */
export class R2StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string | null;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET;

    if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('R2StorageService: missing R2_* env vars');
    }

    this.bucket = bucket;
    this.publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? null;

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async upload(input: UploadInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  async delete(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl}/${key}`;
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
