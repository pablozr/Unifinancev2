import { DEFAULT_CATEGORIES } from '../_data/defaultCategories'
import type { RawBankStatement } from '../_types/types'
import {
  calculateMatchScore,
  detectSpecificPatterns,
  fallbackCategorization,
  isIncomeTransaction,
  applyAdvancedRules,
  type CategorizedTransaction
} from './categorization'

/**
 * Categoriza uma transaÃ§Ã£o automaticamente usando mÃºltiplos mÃ©todos
 */
export function categorizeTransaction(transaction: RawBankStatement): CategorizedTransaction {
  if (isIncomeTransaction(transaction.description, transaction.type)) {
    return {
      ...transaction,
      detectedCategory: undefined,
      categoryConfidence: undefined
    }
  }
  
  let bestCategory = 'Outros'
  let bestScore = 0
  
  // const _normalizedDesc = normalizeText(transaction.description) // não utilizado
  
  const specificPattern = detectSpecificPatterns(transaction.description)
  if (specificPattern) {
    bestCategory = specificPattern.category
    bestScore = specificPattern.confidence
  }
  
  if (bestScore === 0) {
    for (const category of DEFAULT_CATEGORIES) {
      const score = calculateMatchScore(transaction.description, category.keywords)
      
      
      if (score > bestScore && score >= 8) { // Threshold mÃ­nimo de 8
        bestScore = score
        bestCategory = category.name
      }
    }
  }
  
  if (bestScore < 8) {
    
    const fallbackMatch = fallbackCategorization(transaction.description)
    if (fallbackMatch) {
      bestCategory = fallbackMatch.category
      bestScore = fallbackMatch.confidence
    }
  }
  
  const confidence = Math.min(bestScore / 25 * 100, 100) // Ajustar cÃ¡lculo de confianÃ§a
  
  
  return {
    ...transaction,
    detectedCategory: bestCategory,
    categoryConfidence: Math.round(confidence)
  }
}

/**
 * Categoriza mÃºltiplas transaÃ§Ãµes
 */
export function categorizeTransactions(transactions: RawBankStatement[]): CategorizedTransaction[] {
  // Estatísticas removidas por não serem utilizadas
  const categorized = transactions.map(transaction => categorizeTransaction(transaction))
  
  
  return categorized
}

/**
 * Associa categorias detectadas com IDs do banco de dados
 */
export function mapCategoriesToIds(
  categorizedTransactions: CategorizedTransaction[],
  userCategories: Array<{ id: string; name: string }>
): CategorizedTransaction[] {
  const categoryMap = new Map(
    userCategories.map(cat => [cat.name, cat.id])
  )
  
  return categorizedTransactions.map(transaction => ({
    ...transaction,
    categoryId: transaction.detectedCategory 
      ? categoryMap.get(transaction.detectedCategory) 
      : categoryMap.get('Outros')
  }))
}

export { applyAdvancedRules } 
