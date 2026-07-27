import { StockPurchase } from '../../../domain/entities/stock-purchase';
import { IStockPurchaseRepository } from '../../ports/istock-purchase-repository';
import { ValidationError } from '../../../middlewares/errors/errors';

export interface RegisterStockPurchaseInput {
  businessId: number;
  productId: number;
  quantity: number;
  unitCost: number;
  supplier?: string | null;
  notes?: string | null;
  purchasedAt?: Date;
}

/**
 * Registra uma compra de insumo.  A regra do custo médio ponderado
 * (regra 2 do produto) é aplicada dentro da transação do repositório.
 */
export class RegisterStockPurchaseUseCase {
  constructor(private repo: IStockPurchaseRepository) {}

  async execute(input: RegisterStockPurchaseInput) {
    const entity = new StockPurchase({
      businessId: input.businessId,
      productId: input.productId,
      quantity: input.quantity,
      unitCost: input.unitCost,
      supplier: input.supplier ?? null,
      notes: input.notes ?? null,
      purchasedAt: input.purchasedAt,
    });

    if (!entity.isValid()) {
      throw new ValidationError(
        'Dados da compra inválidos (quantidade e custo unitário devem ser > 0).',
      );
    }

    return this.repo.createWithWeightedAverage(entity);
  }
}
