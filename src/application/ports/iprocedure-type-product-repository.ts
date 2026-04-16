import { ProcedureTypeProduct } from '../../domain/entities/procedure-type-product';

export interface IProcedureTypeProductRepository {
  upsert(item: ProcedureTypeProduct): Promise<void>;
  findByProcedureType(procedureTypeId: number, userId: number): Promise<ProcedureTypeProduct[]>;
  delete(id: number, userId: number): Promise<void>;
  deleteByProcedureType(procedureTypeId: number): Promise<void>;
}
