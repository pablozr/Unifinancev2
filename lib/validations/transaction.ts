import { z } from 'zod'

export const transactionTypeEnum = z.enum(['income', 'expense'])

export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category_id: z.string().uuid().optional(),
  date: z.date(),
  type: transactionTypeEnum,
  created_at: z.date(),
})

export const createTransactionSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa'),
  category_id: z.string().uuid().optional(),
  date: z.date(),
  type: transactionTypeEnum,
})

export const updateTransactionSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').max(255, 'Descrição muito longa').optional(),
  category_id: z.string().uuid().optional(),
  date: z.date().optional(),
  type: transactionTypeEnum.optional(),
})

export type Transaction = z.infer<typeof transactionSchema>
export type CreateTransaction = z.infer<typeof createTransactionSchema>
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>
export type TransactionType = z.infer<typeof transactionTypeEnum>
