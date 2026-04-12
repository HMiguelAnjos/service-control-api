import { z } from 'zod';

const productBase = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres'),
  unitCost: z
    .number({ required_error: 'Custo unitário é obrigatório', invalid_type_error: 'unitCost deve ser um número' })
    .positive('Custo unitário deve ser maior que zero'),
  description: z.string().trim().optional(),
});

export const createProductSchema = productBase;
export const updateProductSchema = productBase;
