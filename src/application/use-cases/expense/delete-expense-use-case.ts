import { IExpenseRepository } from '../../../domain/repositories/iexpense-repository';

export class DeleteExpenseUseCase {
  constructor(private repo: IExpenseRepository) {}

  async execute(id: number) {
    await this.repo.delete(id);
  }
}
