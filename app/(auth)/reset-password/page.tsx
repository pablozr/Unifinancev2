import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '../_components'

export default async function ResetPasswordPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  return <ResetPasswordForm />
}


