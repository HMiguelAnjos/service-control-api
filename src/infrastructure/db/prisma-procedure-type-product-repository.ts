import { ProcedureTypeProduct } from '../../domain/entities/procedure-type-product';
import { IProcedureTypeProductRepository } from '../../application/ports/iprocedure-type-product-repository';
import prisma from './prisma';

export class PrismaProcedureTypeProductRepository implements IProcedureTypeProductRepository {
  async upsert(item: ProcedureTypeProduct): Promise<void> {
    await prisma.procedure_type_product.upsert({
      where: { procedureTypeId_productId: { procedureTypeId: item.procedureTypeId, productId: item.productId } },
      create: { procedureTypeId: item.procedureTypeId, productId: item.productId, quantity: item.quantity },
      update: { quantity: item.quantity, deletedAt: null },
    });
  }

  async findByProcedureType(procedureTypeId: number, userId: number): Promise<ProcedureTypeProduct[]> {
    const rows = await prisma.procedure_type_product.findMany({
      where: { procedureTypeId, deletedAt: null, procedureType: { userId } },
      include: { product: true },
    });
    return rows.map((r) => new ProcedureTypeProduct(
      r.id,
      r.procedureTypeId,
      r.productId,
      Number(r.quantity),
      (r as any).product ? Number((r as any).product.unitCost) : undefined,
      (r as any).product ? (r as any).product.name : undefined,
    ));
  }

  async delete(id: number, userId: number): Promise<void> {
    await prisma.procedure_type_product.updateMany({
      where: { id, deletedAt: null, procedureType: { userId } },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByProcedureType(procedureTypeId: number): Promise<void> {
    await prisma.procedure_type_product.updateMany({
      where: { procedureTypeId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}
