'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login as loginAction } from '@/app/auth/_actions'

export function LoginForm() {
  const redirectTo = useSearchParams().get('redirectTo') || '/dashboard'
  const [state, formAction, isPending] = useActionState(loginAction, { success: false })

  return (
    <form action={formAction} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-2 tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="text-white/60 text-sm font-light">
          Entre na sua conta para continuar
        </p>
      </div>

      {state.error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
          <p className="text-red-400 text-sm font-light">{state.error}</p>
        </div>
      )}

      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-light text-white/80 mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-light text-white/80 mb-2">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-white text-black px-6 py-3 rounded-2xl font-medium text-lg hover:bg-white/90 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {isPending ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
            Entrando...
          </div>
        ) : (
          'Entrar na Plataforma'
        )}
      </button>

      <div className="text-center space-y-4 pt-4">
        <Link 
          href="/forgot-password" 
          className="block text-white/60 hover:text-white/80 text-sm font-light transition-colors duration-300"
        >
          Esqueceu sua senha?
        </Link>
        
        <div className="flex items-center">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-4 text-white/40 text-xs font-light">ou</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>
        
        <div className="text-sm font-light text-white/60">
          Não tem uma conta?{' '}
          <Link 
            href="/register" 
            className="text-white hover:text-white/80 font-medium transition-colors duration-300 underline underline-offset-2"
          >
            Cadastre-se gratuitamente
          </Link>
        </div>
      </div>
    </form>
  )
}
