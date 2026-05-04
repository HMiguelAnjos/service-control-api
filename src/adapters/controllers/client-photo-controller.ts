import { NextFunction, Request, Response } from 'express';
import { UploadClientPhotoUseCase } from '../../application/use-cases/client-photo/upload-client-photo-use-case';
import { ListClientPhotosUseCase } from '../../application/use-cases/client-photo/list-client-photos-use-case';
import { DeleteClientPhotoUseCase } from '../../application/use-cases/client-photo/delete-client-photo-use-case';
import { UpdateClientPhotoUseCase } from '../../application/use-cases/client-photo/update-client-photo-use-case';

export class ClientPhotoController {
  constructor(
    private uploadUseCase: UploadClientPhotoUseCase,
    private listUseCase: ListClientPhotosUseCase,
    private deleteUseCase: DeleteClientPhotoUseCase,
    private updateUseCase: UpdateClientPhotoUseCase,
  ) {}

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const clientId = Number(req.params.clientId);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const takenAt = req.body.takenAt ? new Date(req.body.takenAt) : new Date();
      if (Number.isNaN(takenAt.getTime())) {
        return res.status(400).json({ error: 'Data inválida em takenAt.' });
      }

      const photo = await this.uploadUseCase.execute({
        userId,
        clientId,
        buffer: file.buffer,
        takenAt,
        tag: req.body.tag ?? null,
        notes: req.body.notes ?? null,
      });

      return res.status(201).json({
        id: photo.id,
        clientId: photo.clientId,
        tag: photo.tag,
        notes: photo.notes,
        takenAt: photo.takenAt.toISOString(),
        width: photo.width,
        height: photo.height,
        sizeBytes: photo.sizeBytes,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const clientId = Number(req.params.clientId);
      const photos = await this.listUseCase.execute(clientId, userId);
      return res.json(photos);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      const updated = await this.updateUseCase.execute(id, userId, {
        tag: req.body.tag,
        notes: req.body.notes,
        takenAt: req.body.takenAt,
      });
      return res.json({
        id: updated.id,
        tag: updated.tag,
        notes: updated.notes,
        takenAt: updated.takenAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = Number(req.params.id);
      await this.deleteUseCase.execute(id, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
