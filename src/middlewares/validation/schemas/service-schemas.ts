import { z } from 'zod';

const serviceBase = z.object({
  clientId: z
    .number({ required_error: 'Cliente é obrigatório', invalid_type_error: 'clientId deve ser um número' })
    .int('clientId deve ser um inteiro')
    .positive('clientId deve ser positivo'),
  procedureId: z
    .number({ required_error: 'Procedimento é obrigatório', invalid_type_error: 'procedureId deve ser um número' })
    .int('procedureId deve ser um inteiro')
    .positive('procedureId deve ser positivo'),
  price: z
    .number({ required_error: 'Preço é obrigatório', invalid_type_error: 'price deve ser um número' })
    .positive('Preço deve ser maior que zero'),
  date: z.coerce.date().optional(),
  description: z.string().trim().optional(),
});

export const createServiceSchema = serviceBase;
export const updateServiceSchema = serviceBase;
