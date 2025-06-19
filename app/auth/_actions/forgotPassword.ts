'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordFormSchema, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function forgotPasswordAction(_: AuthResult, formData: FormData): Promise<AuthResult> {
  // Validate FormData with robust validation
  const rawData = {
    email: formData.get('email'),
  }

  // Check for null/undefined values
  if (!rawData.email) {
    return { success: false, error: 'Email é obrigatório' }
  }

  const result = forgotPasswordFormSchema.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`

    console.log('🔄 Enviando email de recuperação para:', result.data.email)
    console.log('🔗 URL de redirecionamento:', redirectUrl)

    const { data, error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: redirectUrl,
    })

    console.log('📧 Resposta do Supabase:', { data, error })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)

      // Use centralized error handling with Supabase native rate limiting
      const errorMessage = getErrorMessage(error)

      // For security, don't reveal if email exists for user_not_found errors
      if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
        console.log('ℹ️ Email não encontrado, mas retornando sucesso por segurança')
        return {
          success: true,
          error: 'Se o email estiver cadastrado, você receberá um link de recuperação. Verifique também a pasta de spam.'
        }
      }

      return { success: false, error: errorMessage }
    }

    console.log('✅ Email de recuperação enviado com sucesso')
    return {
      success: true,
      error: 'Link de recuperação enviado para seu email. Verifique também a pasta de spam.'
    }
  } catch (error) {
    console.error('❌ Erro inesperado no forgot password:', error)
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 