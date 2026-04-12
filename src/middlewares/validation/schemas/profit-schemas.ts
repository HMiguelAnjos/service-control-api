import { z } from 'zod';

const profitBase = z.object({
  serviceId: z
    .number({ required_error: 'Atendimento é obrigatório', invalid_type_error: 'serviceId deve ser um número' })
    .int('serviceId deve ser um inteiro')
    .positive('serviceId deve ser positivo'),
  totalProfit: z
    .number({ required_error: 'Lucro total é obrigatório', invalid_type_error: 'totalProfit deve ser um número' })
    .min(0, 'Lucro total não pode ser negativo'),
  marginPct: z
    .number({ required_error: 'Margem é obrigatória', invalid_type_error: 'marginPct deve ser um número' })
    .min(0, 'Margem não pode ser negativa')
    .max(100, 'Margem não pode exceder 100%'),
});

export const createProfitSchema = profitBase;
export const updateProfitSchema = profitBase;
