import { ProcedureType } from '../../domain/entities/procedure-type';

export interface IProcedureTypeRepository {
  create(procedureType: ProcedureType): Promise<void>;
  findAll(userId: number): Promise<ProcedureType[]>;
  findOne(id: number, userId: number): Promise<ProcedureType | null>;
  update(procedureType: ProcedureType): Promise<void>;
  delete(id: number, userId: number): Promise<void>;
}
