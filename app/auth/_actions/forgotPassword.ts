'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordFormSchema, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function forgotPasswordAction(_: AuthResult, formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get('email'),
  }

  if (!rawData.email) {
    return { success: false, error: 'Email Ã© obrigatÃ³rio' }
  }

  const result = forgotPasswordFormSchema.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`


    const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: redirectUrl,
    })


    if (error) {

      const errorMessage = getErrorMessage(error)

      if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
        return {
          success: true,
          error: 'Se o email estiver cadastrado, vocÃª receberÃ¡ um link de recuperaÃ§Ã£o. Verifique tambÃ©m a pasta de spam.'
        }
      }

      return { success: false, error: errorMessage }
    }

    return {
      success: true,
      error: 'Link de recuperaÃ§Ã£o enviado para seu email. Verifique tambÃ©m a pasta de spam.'
    }
  } catch {
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 
