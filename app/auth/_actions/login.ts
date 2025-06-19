'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginFormSchema, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function login(_: AuthResult, formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo') || '/dashboard',
  }

  if (!rawData.email || !rawData.password) {
    return { success: false, error: 'Email e senha são obrigatórios' }
  }

  const result = loginFormSchema.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    })

    if (error) {
      return { success: false, error: getErrorMessage(error) }
    }

    redirect(result.data.redirectTo || '/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 