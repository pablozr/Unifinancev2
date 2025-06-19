import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.date(),
})

export const createUserSchema = z.object({
  email: z.string().email(),
})

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
})

export type User = z.infer<typeof userSchema>
export type CreateUser = z.infer<typeof createUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
