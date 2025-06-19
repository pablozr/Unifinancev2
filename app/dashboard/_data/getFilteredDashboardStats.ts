'use server'
import { cache } from 'react'
import type { DashboardStats, PeriodFilter } from './types'
import { getCurrentMonthRange, getPreviousMonthRange, getDateRangeFromFilter, getPreviousRangeFromFilter } from './utils/dateUtils'
import { calculatePercentageChange, sumTransactionsByType, calculateTotalBalance } from './utils/calculationUtils'
import { queryTransactionsByDateRange, queryAllUserTransactions } from './utils/queryBuilder'

/**
 * @function getFilteredDashboardStats
 * @description Busca estatísticas filtradas por período
 */
const getFilteredDashboardStats = cache(async (
  userId: string, 
  filter?: PeriodFilter
): Promise<DashboardStats> => {
  const currentRange = filter ? getDateRangeFromFilter(filter) : getCurrentMonthRange()
  const previousRange = filter ? getPreviousRangeFromFilter(filter) : getPreviousMonthRange()
  
  if (!currentRange || !previousRange) {
    throw new Error('Range de datas inválido')
  }

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
    transactionCount: currentTransactions.length,
    incomeChange: calculatePercentageChange(currentIncome, previousIncome),
    expenseChange: calculatePercentageChange(currentExpenses, previousExpenses),
    balanceChange: 12.5,
    transactionChange: calculatePercentageChange(currentTransactions.length, previousTransactions.length)
  }
})

export default getFilteredDashboardStats 