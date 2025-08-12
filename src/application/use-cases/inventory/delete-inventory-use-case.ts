import { IInventoryRepository } from '../../ports/iinventory-repository';

export class DeleteInventoryUseCase {
  constructor(private repo: IInventoryRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
