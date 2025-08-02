import { IInventoryRepository } from '../../../domain/repositories/iinventory-repository';

export class DeleteInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
