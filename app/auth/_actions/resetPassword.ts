'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { resetPasswordFormSchema, formatZodError, type AuthResult } from '@/lib/validations/auth'
import { getErrorMessage } from '@/lib/supabase/config'

export default async function resetPasswordAction(_: AuthResult, formData: FormData): Promise<AuthResult> {
  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  if (!rawData.password || !rawData.confirmPassword) {
    return { success: false, error: 'Senha e confirmaÃ§Ã£o sÃ£o obrigatÃ³rias' }
  }

  const result = resetPasswordFormSchema.safeParse(rawData)
  if (!result.success) {
    return formatZodError(result.error)
  }

  try {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        error: 'SessÃ£o invÃ¡lida. Solicite um novo link de recuperaÃ§Ã£o de senha.'
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: result.data.password
    })

    if (error) {
      let errorMessage = getErrorMessage(error)

      if (error.message.includes('New password should be different')) {
        errorMessage = 'A nova senha deve ser diferente da atual'
      }

      return { success: false, error: errorMessage }
    }

    redirect('/dashboard')
  } catch (error) {
    return { success: false, error: 'Erro interno do servidor. Tente novamente.' }
  }
} 
