import { randomUUID } from 'crypto';
import { ClientPhoto, isPhotoTag } from '../../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import { IStorageService } from '../../ports/istorage-service';
import {
  processOriginal,
  processThumbnail,
} from '../../../infrastructure/storage/image-processor';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface UploadClientPhotoInput {
  userId: number;
  clientId: number;
  buffer: Buffer;
  takenAt: Date;
  tag?: string | null;
  notes?: string | null;
}

export class UploadClientPhotoUseCase {
  constructor(
    private repo: IClientPhotoRepository,
    private storage: IStorageService,
  ) {}

  async execute(input: UploadClientPhotoInput): Promise<ClientPhoto> {
    if (!input.buffer || input.buffer.length === 0) {
      throw new ValidationError('Arquivo de imagem vazio.');
    }

    const tag =
      input.tag && input.tag.trim().length > 0
        ? input.tag.trim().toLowerCase()
        : null;
    if (tag !== null && !isPhotoTag(tag)) {
      throw new ValidationError(`Tag inválida: ${tag}`, { field: 'tag' });
    }

    let original;
    let thumb;
    try {
      [original, thumb] = await Promise.all([
        processOriginal(input.buffer),
        processThumbnail(input.buffer),
      ]);
    } catch {
      throw new ValidationError('Não foi possível processar a imagem.');
    }

    const id = randomUUID();
    const baseKey = `clients/${input.userId}/${input.clientId}/${id}`;
    const bucketKey = `${baseKey}.jpg`;
    const thumbKey = `${baseKey}_thumb.jpg`;

    await Promise.all([
      this.storage.upload({
        key: bucketKey,
        body: original.buffer,
        contentType: original.mimeType,
      }),
      this.storage.upload({
        key: thumbKey,
        body: thumb.buffer,
        contentType: thumb.mimeType,
      }),
    ]);

    const photo = new ClientPhoto({
      userId: input.userId,
      clientId: input.clientId,
      bucketKey,
      thumbKey,
      mimeType: original.mimeType,
      sizeBytes: original.sizeBytes,
      width: original.width,
      height: original.height,
      tag,
      notes: input.notes?.trim() || null,
      takenAt: input.takenAt,
    });

    return this.repo.create(photo);
  }
}
