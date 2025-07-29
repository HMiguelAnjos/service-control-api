import { ProcedureType } from "../entities/procedure-type";

export interface IProcedureTypeRepository {
  create(proceduretype: ProcedureType): Promise<void>;
  findAll(): Promise<ProcedureType[]>;
  update(proceduretype: ProcedureType): Promise<void>;
  delete(id: string): Promise<void>;
}
