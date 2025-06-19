'use server'
import { cache } from 'react'
import { getDatabase } from '@/lib/supabase/database'
import type { CashFlowMonth, PeriodFilter } from './types'
import { getDateRangeFromFilter } from './utils/dateUtils'
import { isRefundTransaction } from './utils/calculationUtils'

/**
 * @function getCashFlowData
 * @description Busca dados de fluxo de caixa agrupados por mÃªs
 */
export const getCashFlowData = cache(async (
  userId: string, 
  filter?: PeriodFilter
): Promise<CashFlowMonth[]> => {
  const database = getDatabase()
  const queryConfig: any = {
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

  const monthlyData = new Map<string, {
    month: string
    income: number
    expenses: number
    balance: number
    sortKey: string
  }>()

  const startDate = queryConfig.dateRange?.start || new Date()
  const endDate = queryConfig.dateRange?.end || new Date()
  
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthName = d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
    
    monthlyData.set(monthKey, {
      month: monthName,
      income: 0,
      expenses: 0,
      balance: 0,
      sortKey: monthKey
    })
  }

  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        month: monthName,
        income: 0,
        expenses: 0,
        balance: 0,
        sortKey: monthKey
      })
    }

    const monthData = monthlyData.get(monthKey)!
    const amount = Number(transaction.amount)

    if (transaction.type === 'credit' && !isRefundTransaction(transaction)) {
      monthData.income += amount
    } else if (transaction.type === 'debit') {
      monthData.expenses += amount
    }

    monthData.balance = monthData.income - monthData.expenses
  })

  return Array.from(monthlyData.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ sortKey, ...data }) => data)
})

export default getCashFlowData 
