import { z } from 'zod';

const clientBase = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Telefone inválido')
    .optional(),
  email: z.string().email('E-mail inválido').toLowerCase().optional(),
});

export const createClientSchema = clientBase;
export const updateClientSchema = clientBase;
