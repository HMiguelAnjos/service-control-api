import { z } from 'zod';

const procedureTypeBase = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().trim().optional(),
  costValue: z
    .number({ invalid_type_error: 'Valor de custo deve ser um número' })
    .min(0, 'Valor de custo não pode ser negativo')
    .optional(),
  finalValue: z
    .number({ invalid_type_error: 'Valor final deve ser um número' })
    .min(0, 'Valor final não pode ser negativo')
    .optional(),
});

export const createProcedureTypeSchema = procedureTypeBase;
export const updateProcedureTypeSchema = procedureTypeBase;
