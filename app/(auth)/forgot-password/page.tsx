import { redirectIfAuthenticated } from '@/lib/auth'
import { ForgotPasswordForm } from '../_components'

export default async function ForgotPasswordPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return <ForgotPasswordForm />
}
