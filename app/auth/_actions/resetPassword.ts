'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { resetPasswordFormSchema, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function resetPasswordAction(_: AuthResult, formData: FormData): Promise<AuthResult> {
  // Validate FormData with robust validation
  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  // Check for null/undefined values
  if (!rawData.password || !rawData.confirmPassword) {
    return { success: false, error: 'Senha e confirmação são obrigatórias' }
  }

  const result = resetPasswordFormSchema.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()

    // Verify user has a valid session (came from email link)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        error: 'Sessão inválida. Solicite um novo link de recuperação de senha.'
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: result.data.password
    })

    if (error) {
      // Use centralized error handling with Supabase native rate limiting
      let errorMessage = getErrorMessage(error)

      // Special case for password reset specific errors
      if (error.message.includes('New password should be different')) {
        errorMessage = 'A nova senha deve ser diferente da atual'
      }

      return { success: false, error: errorMessage }
    }

    redirect('/dashboard')
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 