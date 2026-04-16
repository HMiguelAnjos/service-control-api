import { Service, ServiceProcedureInput } from '../../../domain/entities/service';
import { Expense } from '../../../domain/entities/expense';
import { IServiceRepository } from '../../ports/iservice-repository';
import { IExpenseRepository } from '../../ports/iexpense-repository';
import { IInventoryRepository } from '../../ports/iinventory-repository';
import { IProcedureTypeProductRepository } from '../../ports/iprocedure-type-product-repository';
import { BadRequest } from '../../../middlewares/errors/bad-request';

export class CreateServiceUseCase {
  constructor(
    private repo: IServiceRepository,
    private expenseRepo: IExpenseRepository,
    private inventoryRepo: IInventoryRepository,
    private procedureTypeProductRepo: IProcedureTypeProductRepository,
  ) {}

  async execute(input: {
    userId: number;
    clientId: number;
    procedures: ServiceProcedureInput[];
    date?: Date;
    description?: string;
  }) {
    if (!input.procedures || input.procedures.length === 0) {
      throw new BadRequest(400, 'Pelo menos um procedimento é obrigatório');
    }

    const totalPrice = input.procedures.reduce((sum, p) => sum + p.price, 0);

    const entity = new Service(
      undefined,
      input.userId,
      input.clientId,
      totalPrice,
      input.date ?? new Date(),
      input.description,
      input.procedures,
    );

    if (!entity.isValid()) {
      throw new BadRequest(400, 'Dados do atendimento inválidos');
    }

    const created = await this.repo.create(entity);

    // For each procedure, deduct inventory and create material expense
    for (const procedure of input.procedures) {
      const products = await this.procedureTypeProductRepo.findByProcedureType(
        procedure.procedureTypeId,
        input.userId,
      );

      for (const ptp of products) {
        // Deduct from inventory
        await this.inventoryRepo.deductQuantity(ptp.productId, ptp.quantity, input.userId);

        // Create material expense for the cost of products used
        if (ptp.unitCost != null && ptp.unitCost > 0) {
          const materialCost = ptp.unitCost * ptp.quantity;
          const productLabel = ptp.productName ?? `Produto #${ptp.productId}`;
          const expense = new Expense(
            undefined,
            input.userId,
            `Material - ${productLabel}`,
            materialCost,
            created.id,
            `Consumo automático do atendimento`,
          );
          await this.expenseRepo.create(expense);
        }
      }
    }

    return created;
  }
}
