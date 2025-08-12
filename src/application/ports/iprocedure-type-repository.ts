import { ProcedureType } from "../../domain/entities/procedure-type";

export interface IProcedureTypeRepository {
  create(proceduretype: ProcedureType): Promise<void>;
  findAll(): Promise<ProcedureType[]>;
  update(proceduretype: ProcedureType): Promise<void>;
  delete(id: number): Promise<void>;
}
