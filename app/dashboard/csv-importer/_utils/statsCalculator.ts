﻿import { ProcessedTransaction } from '../_types/types'

export interface CategoryStats {
  count: number
  avgConfidence: number
}

export interface StatsResult {
  categorizedCount: number
  categoryStats: Record<string, CategoryStats>
}

export default function calculateCategoryStats(
  transactions: ProcessedTransaction[]
): StatsResult {
  const expensesOnly = transactions.filter(t => t.type === 'debit')
  const categorizedCount = expensesOnly.filter(t => 
    t.detectedCategory && t.detectedCategory !== 'Outros' && t.categoryConfidence! >= 20
  ).length
  
  const categoryStats = expensesOnly.reduce((acc, transaction) => {
    if (transaction.detectedCategory && transaction.categoryConfidence && transaction.categoryConfidence >= 20) {
      const category = transaction.detectedCategory
      const confidence = transaction.categoryConfidence
      
      if (!acc[category]) {
        acc[category] = { count: 0, totalConfidence: 0 }
      }
      
      acc[category].count++
      acc[category].totalConfidence += confidence
    }
    
    return acc
  }, {} as Record<string, { count: number; totalConfidence: number }>)
  
  const finalCategoryStats = Object.entries(categoryStats).reduce((acc, [category, data]) => {
    acc[category] = {
      count: data.count,
      avgConfidence: Math.round(data.totalConfidence / data.count)
    }
    return acc
  }, {} as Record<string, CategoryStats>)


  return {
    categorizedCount,
    categoryStats: finalCategoryStats
  }
} 
