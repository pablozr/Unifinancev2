import { z } from 'zod'

export const budgetPeriodEnum = z.enum(['monthly', 'weekly', 'yearly'])

export const budgetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  period: budgetPeriodEnum,
  created_at: z.date(),
})

export const createBudgetSchema = z.object({
  user_id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  period: budgetPeriodEnum,
})

export const updateBudgetSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount: z.number().positive('Valor deve ser positivo').optional(),
  period: budgetPeriodEnum.optional(),
})

export type Budget = z.infer<typeof budgetSchema>
export type CreateBudget = z.infer<typeof createBudgetSchema>
export type UpdateBudget = z.infer<typeof updateBudgetSchema>
export type BudgetPeriod = z.infer<typeof budgetPeriodEnum>
