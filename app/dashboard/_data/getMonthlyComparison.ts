'use server'
import { cache } from 'react'
import { getDatabase } from '@/lib/supabase/database'
import type { MonthlyData, PeriodFilter } from './types'
import { getDateRangeFromFilter } from './utils/dateUtils'
import { generateMonthKey, generateMonthLabel, calculateAvgTicket, filterMonthlyData } from './utils/insightUtils'
import { sumTransactionsByType } from './utils/calculationUtils'

/**
 * @function getMonthlyComparison
 * @description Busca dados de comparaÃ§Ã£o mensal entre perÃ­odos
 */
export const getMonthlyComparison = cache(async (
  userId: string,
  filter?: PeriodFilter
): Promise<MonthlyData[]> => {
  const database = getDatabase()
  
  let queryConfig: any = {
    userId,
    orderBy: 'date',
    orderDirection: 'asc'
  }

  if (filter) {
    const dateRange = getDateRangeFromFilter(filter)
    if (dateRange) {
      queryConfig.dateRange = dateRange
    }
  } else {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - 12)
    queryConfig.dateRange = { start: startDate, end: endDate }
  }

  const transactions = await database.findManyTransactions(queryConfig)

  if (transactions.length === 0) return []

  const monthlyGroups = new Map<string, any[]>()
  
  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date)
    const monthKey = generateMonthKey(date)
    
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, [])
    }
    monthlyGroups.get(monthKey)!.push(transaction)
  })

  const filteredEntries = filterMonthlyData(monthlyGroups, filter)

  return filteredEntries.map(([monthKey, monthTransactions]) => {
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month, 1)
    
    const income = sumTransactionsByType(monthTransactions, 'credit')
    const expenses = sumTransactionsByType(monthTransactions, 'debit')
    const balance = income - expenses
    const avgTicket = calculateAvgTicket(monthTransactions)

    return {
      month: generateMonthLabel(date),
      income,
      expenses,
      balance,
      transactionCount: monthTransactions.length,
      avgTicket
    }
  })
})

export default getMonthlyComparison 
