import { ClientPhoto } from '../../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import { IStorageService } from '../../ports/istorage-service';

export interface ClientPhotoView {
  id: number;
  userId: number;
  clientId: number;
  url: string | null;
  thumbUrl: string | null;
  legacyFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  tag: string | null;
  notes: string | null;
  takenAt: string;
  createdAt: string;
}

const URL_TTL_SECONDS = 60 * 60;

export class ListClientPhotosUseCase {
  constructor(
    private repo: IClientPhotoRepository,
    private storage: IStorageService,
  ) {}

  async execute(clientId: number, userId: number): Promise<ClientPhotoView[]> {
    const photos = await this.repo.findByClient(clientId, userId);
    return Promise.all(photos.map((p) => this.toView(p)));
  }

  private async toView(p: ClientPhoto): Promise<ClientPhotoView> {
    const [url, thumbUrl] = await Promise.all([
      p.bucketKey ? this.storage.getSignedUrl(p.bucketKey, URL_TTL_SECONDS) : null,
      p.thumbKey ? this.storage.getSignedUrl(p.thumbKey, URL_TTL_SECONDS) : null,
    ]);

    return {
      id: p.id!,
      userId: p.userId,
      clientId: p.clientId,
      url,
      thumbUrl: thumbUrl ?? url,
      legacyFilename: p.filename,
      mimeType: p.mimeType,
      sizeBytes: p.sizeBytes,
      width: p.width,
      height: p.height,
      tag: p.tag,
      notes: p.notes,
      takenAt: p.takenAt.toISOString(),
      createdAt: (p.createdAt ?? new Date()).toISOString(),
    };
  }
}
