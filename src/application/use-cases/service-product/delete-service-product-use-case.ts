import { IServiceProductRepository } from '../../domain/repositories/iserviceproduct-repository';

export class DeleteServiceProductUseCase {
  constructor(private repo: IServiceProductRepository) {}

  async execute(id: string) {
    await this.repo.delete(id);
  }
}
