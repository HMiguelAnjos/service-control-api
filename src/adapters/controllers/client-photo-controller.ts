import { NextFunction, Request, Response } from 'express';
import { UploadClientPhotoUseCase } from '../../application/use-cases/client-photo/upload-client-photo-use-case';
import { ListClientPhotosUseCase } from '../../application/use-cases/client-photo/list-client-photos-use-case';
import { DeleteClientPhotoUseCase } from '../../application/use-cases/client-photo/delete-client-photo-use-case';

export class ClientPhotoController {
  constructor(
    private uploadUseCase: UploadClientPhotoUseCase,
    private listUseCase: ListClientPhotosUseCase,
    private deleteUseCase: DeleteClientPhotoUseCase,
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

      const photo = await this.uploadUseCase.execute({
        userId,
        clientId,
        filename: file.filename,
        takenAt,
      });

      return res.status(201).json(photo);
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
