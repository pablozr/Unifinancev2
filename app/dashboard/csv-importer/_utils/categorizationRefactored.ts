import { DEFAULT_CATEGORIES } from '../_data/defaultCategories'
import type { RawBankStatement } from '../_types/types'
import {
  normalizeText,
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
  let detectionMethod = 'keyword'
  
  
  const normalizedDesc = normalizeText(transaction.description)
  
  const specificPattern = detectSpecificPatterns(transaction.description)
  if (specificPattern) {
    bestCategory = specificPattern.category
    bestScore = specificPattern.confidence
    detectionMethod = 'pattern'
  }
  
  if (bestScore === 0) {
    for (const category of DEFAULT_CATEGORIES) {
      const score = calculateMatchScore(transaction.description, category.keywords)
      
      
      if (score > bestScore && score >= 8) { // Threshold mÃ­nimo de 8
        bestScore = score
        bestCategory = category.name
        detectionMethod = 'keyword'
      }
    }
  }
  
  if (bestScore < 8) {
    
    const fallbackMatch = fallbackCategorization(transaction.description)
    if (fallbackMatch) {
      bestCategory = fallbackMatch.category
      bestScore = fallbackMatch.confidence
      detectionMethod = 'fallback'
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
  
  const receitas = transactions.filter(t => t.type === 'credit')
  const despesas = transactions.filter(t => t.type === 'debit')
  
  
  const categorized = transactions.map(transaction => categorizeTransaction(transaction))
  
  const categorizedTransactions = categorized.filter(t => t.detectedCategory && t.detectedCategory !== 'Outros')
  const uncategorizedTransactions = categorized.filter(t => !t.detectedCategory || t.detectedCategory === 'Outros')
  const receitasNaoCategorizada = categorized.filter(t => t.type === 'credit' && !t.detectedCategory)
  
  
  const successRate = despesas.length > 0 ? 
    (categorizedTransactions.length / despesas.length) * 100 : 0
  
  
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
