'use server'

import { createClient } from '@/lib/supabase/server'
import { registerFormSchemaBasic, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function register(_: AuthResult, formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  if (!rawData.email || !rawData.password || !rawData.confirmPassword) {
    return { success: false, error: 'Todos os campos são obrigatórios' }
  }

  const result = registerFormSchemaBasic.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      return { success: false, error: getErrorMessage(error) }
    }

    return {
      success: true,
      error: 'Conta criada com sucesso! Verifique seu email para confirmar sua conta.'
    }
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 