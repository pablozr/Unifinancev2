import { redirectIfAuthenticated } from '@/lib/auth'
import { RegisterForm } from '@/components/auth/forms/register-form'

export default async function RegisterPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return <RegisterForm />
}
