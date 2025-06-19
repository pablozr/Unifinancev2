import { redirectIfAuthenticated } from '@/lib/auth'
import { ForgotPasswordForm } from '@/components/auth/forms/forgot-form'

export default async function ForgotPasswordPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return <ForgotPasswordForm />
}
