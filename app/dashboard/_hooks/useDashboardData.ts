'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getCashFlowData,
  getCategoryData,
  getFilteredDashboardStats,
  getRecentTransactions,
  getRecurringVsVariableData,
} from '../_data'
import type {
  DashboardStats,
  RecentTransaction,
  CategorySpending,
  CashFlowMonth,
  PeriodFilter,
} from '../_data/types'

const initialStats: DashboardStats = {
  totalBalance: 0,
  balanceChange: 0,
  monthlyIncome: 0,
  incomeChange: 0,
  monthlyExpenses: 0,
  expenseChange: 0,
  transactionCount: 0,
  transactionChange: 0,
}

export function useDashboardData(userId: string, currentFilter: PeriodFilter) {
  const [cashFlowData, setCashFlowData] = useState<CashFlowMonth[]>([])
  const [categoryData, setCategoryData] = useState<CategorySpending[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [recurringVsVariableData, setRecurringVsVariableData] = useState({ recurring: 0, variable: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [cashFlow, categories, recent, dashboardStats, recurringData] = await Promise.all([
        getCashFlowData(userId, currentFilter),
        getCategoryData(userId, currentFilter),
        getRecentTransactions(userId, 4, currentFilter),
        getFilteredDashboardStats(userId, currentFilter),
        getRecurringVsVariableData(userId, currentFilter),
      ])

      setCashFlowData(cashFlow)
      setCategoryData(categories)
      setRecentTransactions(recent)
      setStats(dashboardStats)
      setRecurringVsVariableData(recurringData)
    } catch (error) {
      console.error("Failed to load dashboard data", error)
      // Reset to initial state on error to avoid displaying stale data
      setCashFlowData([])
      setCategoryData([])
      setRecentTransactions([])
      setStats(initialStats)
      setRecurringVsVariableData({ recurring: 0, variable: 0 })
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    cashFlowData,
    categoryData,
    recentTransactions,
    stats,
    recurringVsVariableData,
    isLoading,
  }
} 