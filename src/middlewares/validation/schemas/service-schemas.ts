import { z } from 'zod';

const procedureItemSchema = z.object({
  procedureTypeId: z
    .number({ required_error: 'Tipo de procedimento é obrigatório', invalid_type_error: 'procedureTypeId deve ser um número' })
    .int('procedureTypeId deve ser um inteiro')
    .positive('procedureTypeId deve ser positivo'),
  price: z
    .number({ required_error: 'Preço é obrigatório', invalid_type_error: 'price deve ser um número' })
    .positive('Preço deve ser maior que zero'),
});

const serviceBase = z.object({
  clientId: z
    .number({ required_error: 'Cliente é obrigatório', invalid_type_error: 'clientId deve ser um número' })
    .int('clientId deve ser um inteiro')
    .positive('clientId deve ser positivo'),
  procedures: z
    .array(procedureItemSchema)
    .min(1, 'Pelo menos um procedimento é obrigatório'),
  date: z.coerce.date().optional(),
  description: z.string().trim().optional(),
});

export const createServiceSchema = serviceBase;
export const updateServiceSchema = serviceBase;
