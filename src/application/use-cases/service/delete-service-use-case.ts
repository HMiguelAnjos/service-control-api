import { IServiceRepository } from '../../domain/repositories/iservice-repository';

export class DeleteServiceUseCase {
  constructor(private repo: IServiceRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
