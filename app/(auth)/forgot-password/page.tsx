import { redirectIfAuthenticated } from '@/lib/auth'
import { ForgotPasswordForm } from '../_components'

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated()

  return <ForgotPasswordForm />
}
