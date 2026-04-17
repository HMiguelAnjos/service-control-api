import { z } from 'zod';

export const createInventorySchema = z.object({
  productId: z
    .number({ required_error: 'Produto é obrigatório', invalid_type_error: 'productId deve ser um número' })
    .int('productId deve ser um inteiro')
    .positive('productId deve ser positivo'),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .positive('Quantidade deve ser maior que zero'),
  purchasePrice: z
    .number({ invalid_type_error: 'Valor de compra deve ser um número' })
    .min(0, 'Valor de compra não pode ser negativo')
    .optional(),
});

export const updateInventorySchema = z.object({
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .min(0, 'Quantidade não pode ser negativa'),
  purchasePrice: z
    .number({ invalid_type_error: 'Valor de compra deve ser um número' })
    .min(0, 'Valor de compra não pode ser negativo')
    .optional(),
});
