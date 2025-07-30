import { IClientRepository } from '../../../domain/repositories/iclient-repository';

export class DeleteClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
