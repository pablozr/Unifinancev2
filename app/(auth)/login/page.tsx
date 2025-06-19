import { redirectIfAuthenticated } from '@/lib/auth'
import { LoginForm } from '../_components'

export default async function LoginPage() {
  await redirectIfAuthenticated()
  return <LoginForm />
}
