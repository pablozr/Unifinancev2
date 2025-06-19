'use server'
import { cache } from 'react'
import { getDatabase } from '@/lib/supabase/database'
import type { PeriodFilter } from './types'
import { getDateRangeFromFilter } from './utils/dateUtils'

export interface CategoryData {
  categoryName: string
  totalAmount: number
  percentage: number
  transactionCount: number
  color: string
}

/**
 * @function getCategoryData
 * @description Busca dados agregados por categoria
 */
export const getCategoryData = cache(async (
  userId: string,
  filter?: PeriodFilter
): Promise<CategoryData[]> => {
  const database = getDatabase()
  
  const queryConfig: any = {
    userId,
    includeCategories: true,
    transactionType: 'debit' // Apenas gastos para anÃ¡lise de categoria
  }

  if (filter) {
    const dateRange = getDateRangeFromFilter(filter)
    if (dateRange) {
      queryConfig.dateRange = dateRange
    }
  }

  const transactions = await database.findManyTransactions(queryConfig)

  const categoryMap = new Map<string, {
    totalAmount: number
    count: number
    color: string
  }>()

  let totalSpending = 0

  transactions.forEach((transaction: any) => {
    const amount = Number(transaction.amount)
    const categoryName = transaction.categories?.name || 'Outros'
    const categoryColor = transaction.categories?.color || '#gray-500'

    totalSpending += amount

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        totalAmount: 0,
        count: 0,
        color: categoryColor
      })
    }

    const categoryData = categoryMap.get(categoryName)!
    categoryData.totalAmount += amount
    categoryData.count += 1
  })

  const result: CategoryData[] = Array.from(categoryMap.entries())
    .map(([categoryName, data]) => ({
      categoryName,
      totalAmount: data.totalAmount,
      percentage: totalSpending > 0 ? (data.totalAmount / totalSpending) * 100 : 0,
      transactionCount: data.count,
      color: data.color
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount) // Ordenar por valor

  return result
})

export default getCategoryData 
