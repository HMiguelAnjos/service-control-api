import { ClientPhoto, isPhotoTag } from '../../../domain/entities/client-photo';
import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import { NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export interface UpdateClientPhotoInput {
  tag?: string | null;
  notes?: string | null;
  takenAt?: string;
}

export class UpdateClientPhotoUseCase {
  constructor(private repo: IClientPhotoRepository) {}

  async execute(
    id: number,
    userId: number,
    input: UpdateClientPhotoInput,
  ): Promise<ClientPhoto> {
    let tag: string | null | undefined;
    if (input.tag !== undefined) {
      const trimmed = input.tag === null ? null : input.tag.trim().toLowerCase();
      if (trimmed !== null && trimmed.length > 0 && !isPhotoTag(trimmed)) {
        throw new ValidationError(`Tag inválida: ${trimmed}`, { field: 'tag' });
      }
      tag = trimmed && trimmed.length > 0 ? trimmed : null;
    }

    const notes =
      input.notes === undefined
        ? undefined
        : input.notes === null
          ? null
          : input.notes.trim() || null;

    const takenAt = input.takenAt ? new Date(input.takenAt) : undefined;
    if (takenAt && Number.isNaN(takenAt.getTime())) {
      throw new ValidationError('Data inválida em takenAt.', { field: 'takenAt' });
    }

    const updated = await this.repo.update(id, userId, { tag, notes, takenAt });
    if (!updated) {
      throw new NotFoundError('Foto');
    }
    return updated;
  }
}
