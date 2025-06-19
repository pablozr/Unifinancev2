'use server'
import { cache } from 'react'
import { getDatabase } from '@/lib/supabase/database'
import type { PeriodFilter } from '../../_data/types'
import { getDateRangeFromFilter } from '../../_data/utils/dateUtils'

export interface CategoryInsight {
  categoryName: string
  totalSpent: number
  percentage: number
  transactionCount: number
  avgTransactionAmount: number
  color: string
}

/**
 * @function getCategoryInsights
 * @description Busca insights detalhados por categoria
 */
export const getCategoryInsights = cache(async (
  userId: string,
  filter?: PeriodFilter
): Promise<CategoryInsight[]> => {
  const database = getDatabase()
  
  const dateRange = filter 
    ? getDateRangeFromFilter(filter)
    : undefined

  const queryConfig: any = {
    userId,
    includeCategories: true,
    transactionType: 'debit' // Apenas gastos para insights de categoria
  }

  if (dateRange) {
    queryConfig.dateRange = dateRange
  }

  const transactions = await database.findManyTransactions(queryConfig)

  const categoryData = new Map<string, {
    totalSpent: number
    count: number
    color: string
  }>()

  let totalSpending = 0

  transactions.forEach((transaction: any) => {
    const amount = Number(transaction.amount)
    const categoryName = transaction.categories?.name || 'Outros'
    const categoryColor = transaction.categories?.color || '#gray-500'

    totalSpending += amount

    if (!categoryData.has(categoryName)) {
      categoryData.set(categoryName, {
        totalSpent: 0,
        count: 0,
        color: categoryColor
      })
    }

    const data = categoryData.get(categoryName)!
    data.totalSpent += amount
    data.count += 1
  })

  const insights: CategoryInsight[] = Array.from(categoryData.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      totalSpent: data.totalSpent,
      percentage: totalSpending > 0 ? (data.totalSpent / totalSpending) * 100 : 0,
      transactionCount: data.count,
      avgTransactionAmount: data.totalSpent / data.count,
      color: data.color
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent) // Ordenar por valor gasto

  return insights
})

export default getCategoryInsights 
