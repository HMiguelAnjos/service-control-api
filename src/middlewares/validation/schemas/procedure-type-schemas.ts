import { z } from 'zod';

const procedureTypeBase = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres'),
  description: z.string().trim().optional(),
});

export const createProcedureTypeSchema = procedureTypeBase;
export const updateProcedureTypeSchema = procedureTypeBase;
