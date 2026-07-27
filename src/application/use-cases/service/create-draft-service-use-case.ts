import prisma from '../../../infrastructure/db/prisma';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../middlewares/errors/errors';

export interface CreateDraftServiceInput {
  businessId: number;
  userId: number;
  clientId: number;
  professionalId?: number | null;
  procedureTypeIds: number[];
  date?: Date;
  durationMinutes?: number | null;
  description?: string | null;
}

export interface DraftService {
  id: number;
  status: 'draft';
  clientId: number;
  professionalId: number | null;
  date: string;
  durationMinutes: number | null;
  totalPrice: number;
  procedures: Array<{
    procedureTypeId: number;
    name: string;
    price: number;
    defaultDurationMinutes: number | null;
  }>;
  suggestedProducts: Array<{
    productId: number;
    name: string;
    /** Quantidade que a ficha técnica indica (soma se o produto aparece em vários procedimentos). */
    suggestedQuantity: number;
    /** Custo médio atual do produto (referência — o snapshot congela no confirm). */
    currentUnitCost: number;
    /** Quantidade em estoque agora — o front avisa se for menor que o sugerido. */
    inventoryQuantity: number;
  }>;
}

/**
 * Cria um atendimento em estado `draft`.
 *
 * A ficha técnica de cada procedimento vira `service_product` com
 * `suggestedQuantity` = `quantity` (usuário pode reduzir/aumentar antes
 * do confirm).  Preço total, duração e status snapshot ficam pendentes.
 * Nenhum estoque é baixado até o confirm.
 */
export class CreateDraftServiceUseCase {
  async execute(input: CreateDraftServiceInput): Promise<DraftService> {
    if (!input.procedureTypeIds || input.procedureTypeIds.length === 0) {
      throw new ValidationError('Pelo menos um procedimento é obrigatório.');
    }

    // Cross-tenant guards.
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, businessId: input.businessId, deletedAt: null },
    });
    if (!client) throw new NotFoundError('Cliente');

    if (input.professionalId) {
      const professional = await prisma.professional.findFirst({
        where: { id: input.professionalId, businessId: input.businessId, deletedAt: null },
      });
      if (!professional) throw new NotFoundError('Profissional');
    }

    const procedures = await prisma.procedure_type.findMany({
      where: {
        id: { in: input.procedureTypeIds },
        businessId: input.businessId,
        deletedAt: null,
      },
      include: {
        products: {
          where: { deletedAt: null },
          include: { product: { include: { inventory: true } } },
        },
      },
    });
    if (procedures.length !== input.procedureTypeIds.length) {
      throw new NotFoundError('Procedimento');
    }

    // Aggregate suggested products across all procedures (same product used
    // by 2 procedures = sum of quantities).
    const productMap = new Map<
      number,
      {
        productId: number;
        name: string;
        suggestedQuantity: number;
        currentUnitCost: number;
        inventoryQuantity: number;
      }
    >();
    for (const proc of procedures) {
      for (const ptp of proc.products) {
        const existing = productMap.get(ptp.productId);
        const qty = Number(ptp.quantity);
        if (existing) {
          existing.suggestedQuantity = Math.round((existing.suggestedQuantity + qty) * 1000) / 1000;
        } else {
          productMap.set(ptp.productId, {
            productId: ptp.productId,
            name: ptp.product.name,
            suggestedQuantity: qty,
            currentUnitCost: Number(ptp.product.unitCost),
            inventoryQuantity: ptp.product.inventory ? Number(ptp.product.inventory.quantity) : 0,
          });
        }
      }
    }

    const totalPrice = procedures.reduce((acc, p) => acc + Number(p.finalValue ?? 0), 0);
    const suggestedDuration =
      input.durationMinutes ??
      (procedures.reduce((acc, p) => acc + (p.defaultDurationMinutes ?? 0), 0) || null);

    const draft = await prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          businessId: input.businessId,
          userId: input.userId,
          clientId: input.clientId,
          professionalId: input.professionalId ?? undefined,
          totalPrice,
          date: input.date ?? new Date(),
          durationMinutes: suggestedDuration,
          description: input.description ?? undefined,
          status: 'draft',
        },
      });

      for (const proc of procedures) {
        await tx.service_procedure.create({
          data: {
            serviceId: service.id,
            procedureTypeId: proc.id,
            price: Number(proc.finalValue ?? 0),
          },
        });
      }

      for (const prod of productMap.values()) {
        await tx.service_product.create({
          data: {
            serviceId: service.id,
            productId: prod.productId,
            quantity: prod.suggestedQuantity,
            suggestedQuantity: prod.suggestedQuantity,
          },
        });
      }

      return service;
    });

    return {
      id: draft.id,
      status: 'draft',
      clientId: draft.clientId,
      professionalId: draft.professionalId,
      date: draft.date.toISOString(),
      durationMinutes: draft.durationMinutes,
      totalPrice: Number(draft.totalPrice),
      procedures: procedures.map((p) => ({
        procedureTypeId: p.id,
        name: p.name,
        price: Number(p.finalValue ?? 0),
        defaultDurationMinutes: p.defaultDurationMinutes,
      })),
      suggestedProducts: Array.from(productMap.values()),
    };
  }
}

// Legacy guard for use case's unused imports:
void ForbiddenError;
