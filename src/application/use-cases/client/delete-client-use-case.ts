import { IClientRepository } from '../../ports/iclient-repository';

export class DeleteClientUseCase {
  constructor(private repo: IClientRepository) {}

  async execute(id: number, userId: number) {
    await this.repo.delete(id, userId);
  }
}
