import { z } from 'zod'

// Robust base schemas with comprehensive validation
const email = z
  .string({ required_error: 'Email é obrigatório' })
  .trim()
  .min(1, 'Email não pode estar vazio')
  .max(254, 'Email muito longo')
  .email('Formato de email inválido')
  .toLowerCase()
  .refine(
    (email) => !email.includes('..') && !email.startsWith('.') && !email.endsWith('.'),
    'Email contém pontos consecutivos ou inválidos'
  )

const password = z
  .string({ required_error: 'Senha é obrigatória' })
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial')
  .refine(
    (password) => !/(.)\1{2,}/.test(password),
    'Senha não pode ter mais de 2 caracteres consecutivos iguais'
  )

const redirectTo = z
  .string()
  .optional()
  .refine(
    (url) => !url || (url.startsWith('/') && !url.includes('..') && url.length <= 200),
    'URL de redirecionamento inválida'
  )

// Form data validation (more permissive for better UX)
const formEmail = z
  .string({ required_error: 'Email é obrigatório' })
  .trim()
  .min(1, 'Email não pode estar vazio')
  .max(254, 'Email muito longo')
  .email('Formato de email inválido')
  .toLowerCase()

// Simple password validation for login (no complex requirements)
const loginPassword = z
  .string({ required_error: 'Senha é obrigatória' })
  .min(1, 'Senha é obrigatória')
  .max(128, 'Senha muito longa')

// Strong password validation for registration and reset
const formPassword = z
  .string({ required_error: 'Senha é obrigatória' })
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(128, 'Senha muito longa')

// Auth schemas
export const loginSchema = z.object({
  email: formEmail,
  password: loginPassword, // Simple validation for login
  redirectTo,
})

export const registerSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: formEmail,
})

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

// FormData validation schemas (for Server Actions)
export const loginFormSchema = z.object({
  email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
  password: z.string().pipe(loginPassword), // Simple validation for login
  redirectTo: z.string().optional().pipe(redirectTo),
})

export const registerFormSchema = z
  .object({
    email: z.string().transform((val) => val?.trim() || '').pipe(email),
    password: z.string().pipe(password),
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export const forgotPasswordFormSchema = z.object({
  email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
})

// Use formPassword for registration form (with basic requirements)
export const registerFormSchemaBasic = z
  .object({
    email: z.string().transform((val) => val?.trim() || '').pipe(formEmail),
    password: z.string().pipe(formPassword), // Basic requirements for better UX
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

export const resetPasswordFormSchema = z
  .object({
    password: z.string().pipe(password),
    confirmPassword: z.string({ required_error: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  })

// Types
export type AuthResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

// Utility function for better error handling
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
    error: error.errors[0]?.message || 'Dados inválidos',
    fieldErrors,
  }
}
