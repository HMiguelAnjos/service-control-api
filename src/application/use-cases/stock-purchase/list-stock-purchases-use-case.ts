import { StockPurchase } from '../../../domain/entities/stock-purchase';
import {
  IStockPurchaseRepository,
  ListStockPurchasesFilter,
} from '../../ports/istock-purchase-repository';

export class ListStockPurchasesUseCase {
  constructor(private repo: IStockPurchaseRepository) {}

  async execute(filter: ListStockPurchasesFilter): Promise<StockPurchase[]> {
    return this.repo.list(filter);
  }
}
