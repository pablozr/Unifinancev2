'use client'

import { useActionState } from 'react'
import { resetPassword as resetPasswordAction } from '@/app/auth/_actions'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, { success: false })

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center">Redefinir senha</h2>
        <p className="text-center text-sm text-gray-600">Digite sua nova senha.</p>
      </div>

      {state.error && <Alert>{state.error}</Alert>}

      <FormField
        id="password"
        name="password"
        type="password"
        label="Nova Senha"
        autoComplete="new-password"
        required
        disabled={isPending}
        description="Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo"
      />

      <FormField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirmar Nova Senha"
        autoComplete="new-password"
        required
        disabled={isPending}
      />

      <Button type="submit" loading={isPending} className="w-full">
        Redefinir senha
      </Button>
    </form>
  )
}
