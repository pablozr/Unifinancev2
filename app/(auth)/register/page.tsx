import { redirectIfAuthenticated } from '@/lib/auth'
import { RegisterForm } from '../_components'

export default async function RegisterPage() {
  await redirectIfAuthenticated()

  return <RegisterForm />
}
