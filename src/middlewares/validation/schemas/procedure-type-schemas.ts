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
  defaultDurationMinutes: z
    .number({ invalid_type_error: 'Duração deve ser um número' })
    .int('Duração deve ser inteira')
    .positive('Duração deve ser positiva')
    .nullable()
    .optional(),
  expectedIntervalDays: z
    .number({ invalid_type_error: 'Intervalo esperado deve ser um número' })
    .int('Intervalo esperado deve ser inteiro')
    .positive('Intervalo esperado deve ser positivo')
    .nullable()
    .optional(),
});

export const createProcedureTypeSchema = procedureTypeBase;
export const updateProcedureTypeSchema = procedureTypeBase;
