import Link from 'next/link'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Erro de Autenticação</h2>
          <p className="mt-2 text-sm text-gray-600">
            Houve um problema ao processar seu link de autenticação.
          </p>
        </div>

        <Alert>
          O link pode ter expirado ou já ter sido usado. Tente fazer login novamente ou solicitar um novo link.
        </Alert>

        <div className="space-y-4">
          <Link href="/login">
            <Button className="w-full">Ir para Login</Button>
          </Link>
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Solicitar novo link de recuperação
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
