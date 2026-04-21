import { IClientPhotoRepository } from '../../ports/iclient-photo-repository';
import * as fs from 'fs';
import * as path from 'path';

export class DeleteClientPhotoUseCase {
  constructor(private repo: IClientPhotoRepository) {}

  async execute(id: number, userId: number): Promise<void> {
    const photo = await this.repo.findOne(id, userId);
    if (!photo) return;

    // Remove the file from disk
    const filePath = path.join(process.cwd(), 'uploads', 'client-photos', photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.repo.delete(id, userId);
  }
}
