import { z } from 'zod';

const serviceProductBase = z.object({
  serviceId: z
    .number({ required_error: 'Atendimento é obrigatório', invalid_type_error: 'serviceId deve ser um número' })
    .int('serviceId deve ser um inteiro')
    .positive('serviceId deve ser positivo'),
  productId: z
    .number({ required_error: 'Produto é obrigatório', invalid_type_error: 'productId deve ser um número' })
    .int('productId deve ser um inteiro')
    .positive('productId deve ser positivo'),
  quantity: z
    .number({ required_error: 'Quantidade é obrigatória', invalid_type_error: 'quantity deve ser um número' })
    .int('quantity deve ser um inteiro')
    .positive('Quantidade deve ser maior que zero'),
});

export const createServiceProductSchema = serviceProductBase;
export const updateServiceProductSchema = serviceProductBase;
