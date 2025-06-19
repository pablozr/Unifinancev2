import { redirectIfAuthenticated } from '@/lib/auth'
import { RegisterForm } from '../_components'

export default async function RegisterPage() {
  // Redirect if already authenticated
  await redirectIfAuthenticated()

  return <RegisterForm />
}
