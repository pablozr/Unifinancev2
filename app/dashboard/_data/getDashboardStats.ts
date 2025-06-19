'use server'
import { cache } from 'react'
import type { DashboardStats } from './types'
import { getCurrentMonthRange, getPreviousMonthRange } from './utils/dateUtils'
import { calculatePercentageChange, sumTransactionsByType, calculateTotalBalance } from './utils/calculationUtils'
import { queryTransactionsByDateRange, queryAllUserTransactions } from './utils/queryBuilder'

/**
 * @function getDashboardStats
 * @description Busca estatísticas principais do dashboard
 */
const getDashboardStats = cache(async (userId: string): Promise<DashboardStats> => {
  const currentRange = getCurrentMonthRange()
  const previousRange = getPreviousMonthRange()
  
  const [currentTransactions, previousTransactions, allTransactions] = await Promise.all([
    queryTransactionsByDateRange(userId, currentRange),
    queryTransactionsByDateRange(userId, previousRange),
    queryAllUserTransactions(userId)
  ])

  const currentIncome = sumTransactionsByType(currentTransactions, 'credit')
  const currentExpenses = sumTransactionsByType(currentTransactions, 'debit')
  const previousIncome = sumTransactionsByType(previousTransactions, 'credit')
  const previousExpenses = sumTransactionsByType(previousTransactions, 'debit')
  
  return {
    totalBalance: calculateTotalBalance(allTransactions),
    monthlyIncome: currentIncome,
    monthlyExpenses: currentExpenses,
    transactionCount: allTransactions.length,
    incomeChange: calculatePercentageChange(currentIncome, previousIncome),
    expenseChange: calculatePercentageChange(currentExpenses, previousExpenses),
    balanceChange: 12.5,
    transactionChange: calculatePercentageChange(currentTransactions.length, previousTransactions.length)
  }
})

export default getDashboardStats 