'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword as forgotPasswordAction } from '@/app/auth/_actions'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, { success: false })

  if (state.success) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Email enviado!</h2>
        <Alert type="success">{state.error}</Alert>
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center">Recuperar senha</h2>
        <p className="text-center text-sm text-gray-600">
          Digite seu email para receber um link de redefinição de senha.
        </p>
      </div>

      {state.error && <Alert>{state.error}</Alert>}

      <FormField
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        disabled={isPending}
      />

      <Button type="submit" loading={isPending} className="w-full">
        Enviar link de recuperação
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
