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
    name: 'VisÃ£o Geral',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Dashboard principal'
  },
  {
    name: 'Insights',
    href: '/dashboard/insights',
    icon: ChartBarIcon,
    description: 'GrÃ¡ficos e anÃ¡lises'
  },
  {
    name: 'Importador CSV',
    href: '/dashboard/csv-importer',
    icon: DocumentArrowUpIcon,
    description: 'Importar transaÃ§Ãµes'
  }
]

export function DashboardNavigation({ user }: { user: User }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-3 rounded-xl bg-black/90 backdrop-blur-sm text-white hover:bg-black/95 transition-all duration-200 border border-gray-800 shadow-xl"
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
              className="w-80 h-full bg-black border-r border-gray-800 shadow-2xl"
            >
              <div className="p-4 border-b border-gray-800">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
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
        <div className="flex flex-col flex-grow bg-black border-r border-gray-800 shadow-2xl">
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
      <div className="flex flex-col p-6 border-b border-gray-700">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-light text-white"
        >
          UniFinance
        </motion.h1>
        <p className="text-sm text-gray-400 mt-1">Dashboard Premium</p>
      </div>

      {/* AÃ§Ãµes de TransaÃ§Ã£o */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        {/* BotÃ£o Adicionar */}
        <motion.button
          onClick={handleAddTransaction}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 border border-green-500/30"
        >
          <div className="p-1 bg-white/20 rounded-lg mr-2 flex-shrink-0">
            <PlusIcon />
          </div>
          <span className="whitespace-nowrap">Adicionar TransaÃ§Ã£o</span>
        </motion.button>

        {/* BotÃ£o Excluir */}
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
          className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 transition-all duration-300 border border-red-500/30"
        >
          <div className="p-1 bg-white/20 rounded-lg mr-2 flex-shrink-0">
            <TrashIcon />
          </div>
          <span className="whitespace-nowrap">Excluir TransaÃ§Ã£o</span>
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
                className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gray-800 text-white border border-gray-600'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:border-gray-700 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${
                  isActive 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/50 group-hover:text-gray-300'
                }`}>
                  <Icon />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className={`text-xs ${
                    isActive ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1 h-8 bg-white rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.email}
              </p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              title="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
} 
