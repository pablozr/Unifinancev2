'use server'
import { cache } from 'react'
import { getDatabase } from '@/lib/supabase/database'
import type { PeriodFilter } from '../../_data/types'
import { getDateRangeFromFilter } from '../../_data/utils/dateUtils'
import { calculatePercentageChange } from '../../_data/utils/calculationUtils'

export interface InsightMetrics {
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
  savingsRate: number
  topSpendingCategory: string
  expenseGrowth: number
  incomeStability: number
}

/**
 * @function getInsightMetrics
 * @description Calcula mÃ©tricas avanÃ§adas para insights
 */
export const getInsightMetrics = cache(async (
  userId: string,
  filter?: PeriodFilter
): Promise<InsightMetrics> => {
  const database = getDatabase()
  
  const dateRange = filter 
    ? getDateRangeFromFilter(filter)
    : { 
        start: new Date(new Date().setMonth(new Date().getMonth() - 6)), 
        end: new Date() 
      }

  if (!dateRange) {
    throw new Error('Range de datas invÃ¡lido')
  }

  const transactions = await database.findManyTransactions({
    userId,
    dateRange,
    includeCategories: true
  })

  const monthlyData = new Map<string, { income: number; expenses: number }>()
  const categorySpending = new Map<string, number>()

  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = Number(transaction.amount)

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0 })
    }

    const monthData = monthlyData.get(monthKey)!

    if (transaction.type === 'credit') {
      monthData.income += amount
    } else {
      monthData.expenses += amount
      
      const categoryName = transaction.categories?.name || 'Outros'
      categorySpending.set(categoryName, (categorySpending.get(categoryName) || 0) + amount)
    }
  })

  const months = Array.from(monthlyData.values())
  
  const avgMonthlyIncome = months.reduce((sum, m) => sum + m.income, 0) / months.length || 0
  const avgMonthlyExpenses = months.reduce((sum, m) => sum + m.expenses, 0) / months.length || 0
  
  const savingsRate = avgMonthlyIncome > 0 
    ? ((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome) * 100 
    : 0

  const topSpendingCategory = Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const recentMonths = months.slice(-2)
  const expenseGrowth = recentMonths.length === 2
    ? calculatePercentageChange(recentMonths[1].expenses, recentMonths[0].expenses)
    : 0

  const incomeVariance = months.reduce((sum, m) => {
    return sum + Math.pow(m.income - avgMonthlyIncome, 2)
  }, 0) / months.length || 0
  
  const incomeStdDev = Math.sqrt(incomeVariance)
  const incomeStability = avgMonthlyIncome > 0 
    ? Math.max(0, 100 - (incomeStdDev / avgMonthlyIncome * 100))
    : 0

  return {
    avgMonthlyIncome,
    avgMonthlyExpenses,
    savingsRate,
    topSpendingCategory,
    expenseGrowth,
    incomeStability
  }
})

export default getInsightMetrics 
