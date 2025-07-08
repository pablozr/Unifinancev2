'use client'

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import type { PeriodFilter } from '../_data/types'
import {
  CashFlowChart,
  CategoryPieChart,
  RecurringVsVariableChart,
  PeriodSelector,
  TransactionsModal,
  DataManagement,
} from '.'
import { useDashboardData } from '../_hooks/useDashboardData'
import { formatRelativeDateBR } from '@/lib/utils/validDate'
import { formatCurrency, formatPercentage } from '@/lib/utils/currency'
import { useRouter, usePathname } from 'next/navigation'
import { getDateRangeFromFilter } from '../_data/utils/dateUtils'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CreditCardIcon,
  ChartBarIcon,
} from '@/components/icons'

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ReactNode
}

interface DashboardOverviewProps {
  userId: string
}

export function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>({ type: 'custom' })
  const router = useRouter()
  const pathname = usePathname()

  const {
    cashFlowData,
    categoryData,
    recentTransactions,
    stats,
    recurringVsVariableData,
    isLoading,
  } = useDashboardData(userId, currentFilter)

  const handlePeriodChange = (filter: PeriodFilter) => {
    setCurrentFilter(filter)
  }

  const statCards: StatCard[] = [
    {
      title: 'Saldo Total',
      value: formatCurrency(stats.totalBalance),
      change: formatPercentage(stats.balanceChange),
      changeType: stats.balanceChange >= 0 ? 'positive' : 'negative',
      icon: <CreditCardIcon />
    },
    {
      title: currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined
        ? 'Receitas do Mês'
        : currentFilter.type === 'yearly' && currentFilter.year
        ? 'Receitas do Ano'
        : 'Receitas do Período',
      value: formatCurrency(stats.monthlyIncome),
      change: formatPercentage(stats.incomeChange),
      changeType: stats.incomeChange >= 0 ? 'positive' : 'negative',
      icon: <TrendingUpIcon />
    },
    {
      title: currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined
        ? 'Despesas do Mês'
        : currentFilter.type === 'yearly' && currentFilter.year
        ? 'Despesas do Ano'
        : 'Despesas do Período',
      value: formatCurrency(stats.monthlyExpenses),
      change: formatPercentage(stats.expenseChange),
      changeType: stats.expenseChange <= 0 ? 'positive' : 'negative',
      icon: <TrendingDownIcon />
    },
    {
      title: 'Transações',
      value: stats.transactionCount.toString(),
      change: formatPercentage(stats.transactionChange),
      changeType: stats.transactionChange >= 0 ? 'positive' : 'negative',
      icon: <ChartBarIcon />
    }
  ]

  const chartCategoryData = categoryData.map(cat => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    color: cat.color,
    percentage: cat.percentage
  }))

  const recurringChartData = [
    { name: 'Despesas Recorrentes', value: recurringVsVariableData.recurring, color: '#3b82f6' },
    { name: 'Despesas Variáveis', value: recurringVsVariableData.variable, color: '#ef4444' },
  ]

  const periodDateRange = useMemo(() => getDateRangeFromFilter(currentFilter), [currentFilter])

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-light text-white mb-3">
              Visão Geral
            </h1>
            <p className="text-white/60 text-lg">Acompanhe suas finanças em tempo real</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
                onClick={() => router.push(`${pathname}?modal=manage-recurring`)}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
            >
                Gerenciar Despesas Recorrentes
            </button>
            {/* Seletor de Período */}
            <div className="w-full sm:w-auto">
              <PeriodSelector 
                currentFilter={currentFilter}
                onPeriodChange={handlePeriodChange}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
      >
        {isLoading ? (
          [...Array(4)].map((_, index) => (
            <div key={index} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-white/[0.05] rounded animate-pulse"></div>
                  <div className="h-8 bg-white/[0.05] rounded animate-pulse"></div>
                  <div className="h-3 bg-white/[0.05] rounded w-20 animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-white/[0.05] rounded-xl animate-pulse"></div>
              </div>
            </div>
          ))
        ) : (
          statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden"
            >
              {/* Spotlight effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center text-white/60">
                    {card.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {card.change}
                  </span>
                </div>
                <h3 className="text-white/60 text-sm font-medium mb-1">{card.title}</h3>
                <p className={`text-2xl font-light ${
                  card.title === 'Saldo Total' 
                    ? stats.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
                    : card.title.includes('Receitas') 
                    ? 'text-green-400'
                    : card.title.includes('Despesas') 
                    ? 'text-red-400'
                    : 'text-white'
                }`}>
                  {card.value}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Fluxo de Caixa */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isLoading ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Fluxo de Caixa</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="h-full w-full animate-pulse bg-white/[0.05] rounded-lg"></div>
              </div>
            </div>
          ) : (
            <CashFlowChart 
              data={cashFlowData} 
              title="Fluxo de Caixa" 
            />
          )}
        </motion.div>

        {/* Despesas Recorrentes vs Variáveis */}
        <div>
          {isLoading ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Despesas Recorrentes vs. Variáveis</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="h-full w-full animate-pulse bg-white/[0.05] rounded-lg"></div>
              </div>
            </div>
          ) : (
            <RecurringVsVariableChart
              key={JSON.stringify(recurringChartData)}
              data={recurringChartData}
              title="Despesas Recorrentes vs. Variáveis"
            />
          )}
        </div>

        {/* Categorias de Despesa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="xl:col-span-2"
        >
          {isLoading ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Categorias de Despesa</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="h-full w-full animate-pulse bg-white/[0.05] rounded-lg"></div>
              </div>
            </div>
          ) : (
            <CategoryPieChart 
              data={chartCategoryData} 
              title="Categorias de Despesa" 
            />
          )}
        </motion.div>
      </div>

      {/* Tabela de Transações Recentes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-light text-white">Transações Recentes</h2>
          <TransactionsModal
            userId={userId}
            currentFilter={currentFilter}
          />
        </div>
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 sm:p-6">
          <ul className="space-y-2">
            {recentTransactions.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-900/50 rounded-lg sm:rounded-xl transition-all duration-200 space-y-2 sm:space-y-0"
              >
                {/* Left side: Icon + Description */}
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {transaction.type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate" title={transaction.description}>
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                      <span className="text-gray-400 truncate">
                        {transaction.categoryName || 'Sem categoria'}
                      </span>
                      <span className="text-gray-500 hidden sm:inline">•</span>
                      <span className="text-gray-500">{formatRelativeDateBR(transaction.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount */}
                <div className="self-end sm:self-center">
                  <span className={`font-medium text-base ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'expense' ? '- ' : '+ '}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Gerenciamento de Dados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <DataManagement userId={userId} />
      </motion.div>
    </div>
  )
} 
