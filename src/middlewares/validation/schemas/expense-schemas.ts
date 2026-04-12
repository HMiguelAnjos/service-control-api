import { z } from 'zod';

const expenseBase = z.object({
  serviceId: z
    .number({ required_error: 'Atendimento é obrigatório', invalid_type_error: 'serviceId deve ser um número' })
    .int('serviceId deve ser um inteiro')
    .positive('serviceId deve ser positivo'),
  category: z
    .string({ required_error: 'Categoria é obrigatória' })
    .trim()
    .min(1, 'Categoria é obrigatória'),
  amount: z
    .number({ required_error: 'Valor é obrigatório', invalid_type_error: 'amount deve ser um número' })
    .positive('Valor deve ser maior que zero'),
  notes: z.string().trim().optional(),
});

export const createExpenseSchema = expenseBase;
export const updateExpenseSchema = expenseBase;
