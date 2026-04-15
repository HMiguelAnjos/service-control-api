import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).trim().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .email('E-mail inválido')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'E-mail é obrigatório' }).email('E-mail inválido').toLowerCase(),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'E-mail é obrigatório' }).email('E-mail inválido').toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Token é obrigatório' }).min(1, 'Token é obrigatório'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter ao menos 6 caracteres'),
});
