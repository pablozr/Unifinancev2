import { z } from 'zod'

const email = z
  .string({ required_error: 'Email Ã© obrigatÃ³rio' })
  .trim()
  .min(1, 'Email nÃ£o pode estar vazio')
  .max(254, 'Email muito longo')
  .email('Formato de email invÃ¡lido')
  .toLowerCase()
  .refine(
    (email) => !email.includes('..') && !email.startsWith('.') && !email.endsWith('.'),
    'Email contÃ©m pontos consecutivos ou invÃ¡lidos'
  )

const password = z
  .string({ required_error: 'Senha Ã© obrigatÃ³ria' })
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minÃºscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiÃºscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um nÃºmero')
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial')
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    'Senha nÃ£o pode ter mais de 2 caracteres consecutivos iguais'
  )

const redirectTo = z
  .string()
  .optional()
  .refine(
    (url) => !url || (url.startsWith('/') && !url.includes('..') && url.length <= 200),
    'URL de redirecionamento invÃ¡lida'
  )

const formEmail = z
  .string({ required_error: 'Email Ã© obrigatÃ³rio' })
  .trim()
  .min(1, 'Email nÃ£o pode estar vazio')
  .max(254, 'Email muito longo')
  .email('Formato de email invÃ¡lido')
  .toLowerCase()

const loginPassword = z
  .string({ required_error: 'Senha Ã© obrigatÃ³ria' })
  .min(1, 'Senha Ã© obrigatÃ³ria')
  .max(128, 'Senha muito longa')

const formPassword = z
  .string({ required_error: 'Senha Ã© obrigatÃ³ria' })
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa')

export const loginSchema = z.object({
  email: formEmail,
  password: loginPassword, // Simple validation for login
  redirectTo,
})

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string({ required_error: 'ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas nÃ£o coincidem',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: formEmail,
})

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string({ required_error: 'ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas nÃ£o coincidem',
    path: ['confirmPassword'],
  })

export const loginFormSchema = z.object({
  email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
  password: z.string().pipe(loginPassword), // Simple validation for login
  redirectTo: z.string().optional().pipe(redirectTo),
})

export const registerFormSchema = z
  .object({
    email: z.string().transform((val) => val?.trim() || '').pipe(email),
    password: z.string().pipe(password),
    confirmPassword: z.string({ required_error: 'ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas nÃ£o coincidem',
    path: ['confirmPassword'],
  })

export const forgotPasswordFormSchema = z.object({
  email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
})

export const registerFormSchemaBasic = z
  .object({
    email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
    password: z.string().pipe(formPassword), // Basic requirements for better UX
    confirmPassword: z.string({ required_error: 'ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas nÃ£o coincidem',
    path: ['confirmPassword'],
  })

export const resetPasswordFormSchema = z
  .object({
    password: z.string().pipe(password),
    confirmPassword: z.string({ required_error: 'ConfirmaÃ§Ã£o de senha Ã© obrigatÃ³ria' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas nÃ£o coincidem',
    path: ['confirmPassword'],
  })

export type AuthResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export function formatZodError(error: z.ZodError): AuthResult {
  const fieldErrors: Record<string, string[]> = {}

  error.errors.forEach((err) => {
    const path = err.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(err.message)
  })

  return {
    success: false,
    error: error.errors[0]?.message || 'Dados invÃ¡lidos',
    fieldErrors,
  }
}
