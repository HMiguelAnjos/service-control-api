import { ProcedureType } from "../../../domain/entities/procedure-type";
import { IProcedureTypeRepository } from "../../ports/iprocedure-type-repository";


export class UpdateProcedureTypeUseCase {
  constructor(private repo: IProcedureTypeRepository) {}

  async execute(input: { id: number; name: string; description?: string }) {
    const entity = new ProcedureType(input.id, input.name, input.description);
    if (!entity.isValid()) {
      throw new Error('Invalid procedure_type data');
    }
    await this.repo.update(entity);
  }
}
