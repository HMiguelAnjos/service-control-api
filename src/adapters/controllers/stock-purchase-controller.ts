import { NextFunction, Request, Response } from 'express';
import { StockPurchase } from '../../domain/entities/stock-purchase';
import { RegisterStockPurchaseUseCase } from '../../application/use-cases/stock-purchase/register-stock-purchase-use-case';
import { ListStockPurchasesUseCase } from '../../application/use-cases/stock-purchase/list-stock-purchases-use-case';
import { ForbiddenError, ValidationError } from '../../middlewares/errors/errors';

function serialise(p: StockPurchase) {
  return {
    id: p.id,
    businessId: p.businessId,
    productId: p.productId,
    quantity: p.quantity,
    unitCost: p.unitCost,
    totalCost: p.totalCost,
    supplier: p.supplier,
    notes: p.notes,
    purchasedAt: p.purchasedAt.toISOString(),
    createdAt: p.createdAt?.toISOString(),
  };
}

function parseOptionalDate(input: unknown, field: string): Date | undefined {
  if (input === undefined || input === null || input === '') return undefined;
  if (typeof input !== 'string') throw new ValidationError(`${field} inválida.`);
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new ValidationError(`${field} inválida.`);
  return d;
}

/**
 * Every stock-purchase endpoint is business-scoped.  If the caller's
 * account has not been linked to a business yet (very old accounts that
 * predate the seed backfill), we refuse — the front should call
 * `/onboarding` before hitting these endpoints.
 */
function requireBusinessId(req: Request): number {
  const id = req.user?.businessId;
  if (!id) {
    throw new ForbiddenError(
      'Conta ainda não vinculada a um estabelecimento. Complete o cadastro do negócio antes de usar este recurso.',
    );
  }
  return id;
}

export class StockPurchaseController {
  constructor(
    private registerUC: RegisterStockPurchaseUseCase,
    private listUC: ListStockPurchasesUseCase,
  ) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const body = req.body ?? {};

      const productId = Number(body.productId);
      const quantity = Number(body.quantity);
      const unitCost = Number(body.unitCost);
      if (!Number.isFinite(productId) || productId <= 0) {
        throw new ValidationError('productId obrigatório.');
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new ValidationError('quantity precisa ser maior que zero.');
      }
      if (!Number.isFinite(unitCost) || unitCost < 0) {
        throw new ValidationError('unitCost precisa ser ≥ 0.');
      }

      const result = await this.registerUC.execute({
        businessId,
        productId,
        quantity,
        unitCost,
        supplier: body.supplier ?? null,
        notes: body.notes ?? null,
        purchasedAt: parseOptionalDate(body.purchasedAt, 'purchasedAt'),
      });

      return res.status(201).json({
        purchase: serialise(result.purchase),
        product: {
          id: productId,
          newUnitCost: result.newUnitCost,
          newQuantity: result.newQuantity,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const businessId = requireBusinessId(req);
      const { productId, from, to } = req.query;
      const items = await this.listUC.execute({
        businessId,
        productId: productId ? Number(productId) : undefined,
        from: parseOptionalDate(from, 'from'),
        to: parseOptionalDate(to, 'to'),
      });
      return res.json(items.map(serialise));
    } catch (err) {
      next(err);
    }
  }
}
