import { IInventoryRepository } from '../../domain/repositories/iinventory-repository';

export class DeleteInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
