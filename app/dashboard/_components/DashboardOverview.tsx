'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { 
  getCashFlowData, 
  getRecentTransactions, 
  getFilteredDashboardStats,
  getCategoryData
} from '../_data'
import type { 
  DashboardStats, 
  RecentTransaction, 
  CategorySpending, 
  CashFlowMonth, 
  PeriodFilter 
} from '../_data/types'
import { CashFlowChart, CategoryPieChart } from './DashboardCharts'
import { PeriodSelector } from './PeriodSelector'
import { TransactionsModal } from './TransactionsModal'
import { DataManagement } from './DataManagement'
import { formatRelativeDateBR } from '@/lib/utils/validDate'
import { formatCurrency, formatPercentage } from '@/lib/utils/currency'


const TrendingUpIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const CreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

interface StatCard {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ReactNode
}

interface DashboardOverviewProps {
  stats: DashboardStats
  recentTransactions: RecentTransaction[]
  categorySpending: CategorySpending[]
  userId: string
}



export function DashboardOverview({ stats, recentTransactions, categorySpending, userId }: DashboardOverviewProps) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowMonth[]>([])
  const [filteredCategoryData, setFilteredCategoryData] = useState<CategorySpending[]>(categorySpending)
  const [filteredRecentTransactions, setFilteredRecentTransactions] = useState<RecentTransaction[]>(recentTransactions)
  const [filteredStats, setFilteredStats] = useState<DashboardStats>(stats)
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>({ type: 'custom' })
  const [isLoadingCharts, setIsLoadingCharts] = useState(false)

  const loadChartData = useCallback(async () => {
    setIsLoadingCharts(true)
    try {
      const [cashFlow, categories, recentTrans, dashboardStats] = await Promise.all([
        getCashFlowData(userId, currentFilter),
        getCategoryData(userId, currentFilter),
        getRecentTransactions(userId, 4, currentFilter),
        getFilteredDashboardStats(userId, currentFilter)
      ])
      
      setCashFlowData(cashFlow)
      setFilteredCategoryData(categories)
      setFilteredRecentTransactions(recentTrans)
      setFilteredStats(dashboardStats)
    } catch (error) {
      // ... existing code ...
    } finally {
      setIsLoadingCharts(false)
    }
  }, [userId, currentFilter])

  useEffect(() => {
    loadChartData()
  }, [currentFilter, userId, loadChartData])

  const handlePeriodChange = (filter: PeriodFilter) => {
    setCurrentFilter(filter)
  }

  const statCards: StatCard[] = [
    {
      title: 'Saldo Total',
      value: formatCurrency(filteredStats.totalBalance),
      change: formatPercentage(filteredStats.balanceChange),
      changeType: filteredStats.balanceChange >= 0 ? 'positive' : 'negative',
      icon: <CreditCardIcon />
    },
    {
      title: currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined
        ? 'Receitas do Mês'
        : currentFilter.type === 'yearly' && currentFilter.year
        ? 'Receitas do Ano'
        : 'Receitas do Período',
      value: formatCurrency(filteredStats.monthlyIncome),
      change: formatPercentage(filteredStats.incomeChange),
      changeType: filteredStats.incomeChange >= 0 ? 'positive' : 'negative',
      icon: <TrendingUpIcon />
    },
    {
      title: currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined
        ? 'Despesas do Mês'
        : currentFilter.type === 'yearly' && currentFilter.year
        ? 'Despesas do Ano'
        : 'Despesas do Período',
      value: formatCurrency(filteredStats.monthlyExpenses),
      change: formatPercentage(filteredStats.expenseChange),
      changeType: filteredStats.expenseChange <= 0 ? 'positive' : 'negative',
      icon: <TrendingDownIcon />
    },
    {
      title: 'Transações',
      value: filteredStats.transactionCount.toString(),
      change: formatPercentage(filteredStats.transactionChange),
      changeType: filteredStats.transactionChange >= 0 ? 'positive' : 'negative',
      icon: <ChartBarIcon />
    }
  ]

  const chartCategoryData = filteredCategoryData.map(cat => ({
    name: cat.categoryName,
    value: cat.totalAmount,
    color: cat.color,
    percentage: cat.percentage
  }))

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
          
          {/* Seletor de Período */}
          <div className="w-full sm:w-auto">
            <PeriodSelector 
              currentFilter={currentFilter}
              onPeriodChange={handlePeriodChange}
            />
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
        {isLoadingCharts ? (
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
                    ? filteredStats.totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
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
          {isLoadingCharts ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Fluxo de Caixa</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
              </div>
            </div>
          ) : (
            <CashFlowChart 
              data={cashFlowData} 
              title="Fluxo de Caixa" 
            />
          )}
        </motion.div>

        {/* Categorias */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {isLoadingCharts ? (
            <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-medium text-white mb-4">Gastos por Categoria</h3>
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
              </div>
            </div>
          ) : (
            <CategoryPieChart 
              data={chartCategoryData} 
              title="Gastos por Categoria" 
            />
          )}
        </motion.div>
      </div>

      {/* Transações Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
          <h3 className="text-xl font-medium text-white">Transações Recentes</h3>
          <TransactionsModal userId={userId} currentFilter={currentFilter} />
        </div>
        
        <div className="space-y-4">
          {isLoadingCharts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/20"></div>
            </div>
          ) : filteredRecentTransactions.length > 0 ? filteredRecentTransactions.map((transaction, index) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/[0.02] rounded-xl transition-all duration-200 border border-white/[0.05] space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUpIcon />
                  ) : (
                    <TrendingDownIcon />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{transaction.description}</p>
                  <p className="text-white/60 text-sm truncate">{transaction.categoryName || 'Sem categoria'}</p>
                </div>
              </div>
              
              <div className="flex justify-between sm:block sm:text-right">
                <p className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </p>
                <p className="text-white/60 text-sm">{formatRelativeDateBR(transaction.date)}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-8">
              <p className="text-white/60">
                {currentFilter.type === 'monthly' || currentFilter.type === 'yearly' 
                  ? 'Nenhuma transação encontrada para este período'
                  : 'Nenhuma transação encontrada'
                }
              </p>
              <p className="text-white/40 text-sm mt-1">
                {currentFilter.type === 'monthly' || currentFilter.type === 'yearly'
                  ? 'Tente selecionar um período diferente'
                  : 'Suas transações aparecerão aqui'
                }
              </p>
            </div>
          )}
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
