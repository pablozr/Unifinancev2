import { redirectIfAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/auth/forms/login-form'

export default async function LoginPage() {
  await redirectIfAuthenticated()
  return <LoginForm />
}
