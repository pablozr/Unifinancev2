'use client'

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import logout from '@/app/auth/_actions/logout'

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const DocumentArrowUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 0l-2-2m2 2l2-2" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Bars3Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const XMarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description: string
}

const navigation: NavigationItem[] = [
  {
    name: 'Visão Geral',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Dashboard principal'
  },
  {
    name: 'Insights',
    href: '/dashboard/insights',
    icon: ChartBarIcon,
    description: 'Gráficos e análises'
  },
  {
    name: 'Importador CSV',
    href: '/dashboard/csv-importer',
    icon: DocumentArrowUpIcon,
    description: 'Importar transações'
  }
]

export function DashboardNavigation({ user }: { user: User }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 sm:top-4 left-3 sm:left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-black/90 backdrop-blur-sm text-white hover:bg-black/95 transition-all duration-200 border border-white/30 shadow-xl hover:border-white/40"
        >
          <Bars3Icon />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 sm:w-96 h-full bg-black border-r border-white/20 shadow-2xl"
            >
              <div className="p-3 sm:p-4 border-b border-white/10">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 sm:p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <XMarkIcon />
                </button>
              </div>
              <NavigationContent pathname={pathname} user={user} onItemClick={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-black border-r border-white/20 shadow-2xl">
          <NavigationContent pathname={pathname} user={user} />
        </div>
      </div>
    </>
  )
}

function NavigationContent({ pathname, user, onItemClick }: { pathname: string; user: User; onItemClick?: () => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAddTransaction = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('modal', 'add-transaction')
    router.push(`?${params.toString()}`, { scroll: false })
    onItemClick?.()
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col p-4 sm:p-6 border-b border-white/10">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl sm:text-2xl font-light text-white"
        >
          UniFinance
        </motion.h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1">Dashboard Premium</p>
      </div>

      {/* Ações de Transação */}
      <div className="p-3 sm:p-4 border-b border-white/10 space-y-2 sm:space-y-3">
        {/* Botão Adicionar */}
        <motion.button
          onClick={handleAddTransaction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-white text-black font-medium rounded-lg sm:rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg text-sm sm:text-base"
        >
          <div className="p-0.5 sm:p-1 bg-black/10 rounded-md sm:rounded-lg mr-2 flex-shrink-0">
            <PlusIcon />
          </div>
          <span className="whitespace-nowrap">Adicionar Transação</span>
        </motion.button>

        {/* Botão Excluir */}
        <motion.button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('modal', 'delete-transaction')
            router.push(`?${params.toString()}`, { scroll: false })
            onItemClick?.()
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 bg-white/10 border border-white/20 text-white font-medium rounded-lg sm:rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
        >
          <div className="p-0.5 sm:p-1 bg-white/20 rounded-md sm:rounded-lg mr-2 flex-shrink-0">
            <TrashIcon />
          </div>
          <span className="whitespace-nowrap">Excluir Transação</span>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                onClick={onItemClick}
                className={`group flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg sm:rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg'
                    : 'text-white/70 hover:bg-white/[0.05] hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg mr-2 sm:mr-3 transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-white/50 truncate hidden sm:block">{item.description}</div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs sm:text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs sm:text-sm font-medium truncate">{user.email}</p>
            <p className="text-white/60 text-xs truncate">Usuário Ativo</p>
          </div>
        </div>
      </div>
    </>
  )
} 
