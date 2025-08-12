import { IServiceRepository } from '../../ports/iservice-repository';

export class DeleteServiceUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
