import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/forms/reset-form'

export default async function ResetPasswordPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <ResetPasswordForm />
}


