import { z } from 'zod';

const inventoryBase = z.object({
  productId: z
    .number({ required_error: 'Produto é obrigatório', invalid_type_error: 'productId deve ser um número' })
    .int('productId deve ser um inteiro')
    .positive('productId deve ser positivo'),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .int('quantity deve ser um inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
});

export const createInventorySchema = inventoryBase;
export const updateInventorySchema = z.object({
  productId: z
    .number({ invalid_type_error: 'productId deve ser um número' })
    .int('productId deve ser um inteiro')
    .positive('productId deve ser positivo'),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .int('quantity deve ser um inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
});
