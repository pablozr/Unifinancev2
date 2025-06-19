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
 * Categoriza uma transação automaticamente usando múltiplos métodos
 */
export function categorizeTransaction(transaction: RawBankStatement): CategorizedTransaction {
  // 1. Verificar se é receita (não categorizar)
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
  
  console.log(`🔍 Analisando despesa: "${transaction.description}" - R$ ${transaction.amount}`)
  
  const normalizedDesc = normalizeText(transaction.description)
  console.log(`  🔤 Texto normalizado: "${normalizedDesc}"`)
  
  // 2. Detectar padrões específicos primeiro (alta prioridade)
  const specificPattern = detectSpecificPatterns(transaction.description)
  if (specificPattern) {
    bestCategory = specificPattern.category
    bestScore = specificPattern.confidence
    detectionMethod = 'pattern'
    console.log(`  🎯 ${specificPattern.pattern} detectado! Categoria: ${bestCategory} (prioridade máxima)`)
  }
  
  // 3. Se não foi detectado padrão específico, usar categorização por keywords
  if (bestScore === 0) {
    for (const category of DEFAULT_CATEGORIES) {
      const score = calculateMatchScore(transaction.description, category.keywords)
      
      console.log(`  📊 ${category.name}: score ${score.toFixed(1)}`)
      
      if (score > bestScore && score >= 8) { // Threshold mínimo de 8
        bestScore = score
        bestCategory = category.name
        detectionMethod = 'keyword'
      }
    }
  }
  
  // 4. Fallback: categorização por padrões simples se score ainda baixo
  if (bestScore < 8) {
    console.log(`  🔄 Aplicando fallback para: "${normalizedDesc}"`)
    
    const fallbackMatch = fallbackCategorization(transaction.description)
    if (fallbackMatch) {
      bestCategory = fallbackMatch.category
      bestScore = fallbackMatch.confidence
      detectionMethod = 'fallback'
      console.log(`  💡 ${fallbackMatch.reason}`)
    }
  }
  
  const confidence = Math.min(bestScore / 25 * 100, 100) // Ajustar cálculo de confiança
  
  console.log(`  ✅ Categoria final: ${bestCategory} (confiança: ${Math.round(confidence)}%, método: ${detectionMethod})`)
  
  return {
    ...transaction,
    detectedCategory: bestCategory,
    categoryConfidence: Math.round(confidence)
  }
}

/**
 * Categoriza múltiplas transações
 */
export function categorizeTransactions(transactions: RawBankStatement[]): CategorizedTransaction[] {
  console.log(`🤖 Iniciando categorização automática de ${transactions.length} transações`)
  
  // Separar receitas de despesas
  const receitas = transactions.filter(t => t.type === 'credit')
  const despesas = transactions.filter(t => t.type === 'debit')
  
  console.log(`💰 ${receitas.length} receitas encontradas (não serão categorizadas)`)
  console.log(`💸 ${despesas.length} despesas encontradas (serão categorizadas)`)
  
  const categorized = transactions.map(transaction => categorizeTransaction(transaction))
  
  // Estatísticas
  const categorizedTransactions = categorized.filter(t => t.detectedCategory && t.detectedCategory !== 'Outros')
  const uncategorizedTransactions = categorized.filter(t => !t.detectedCategory || t.detectedCategory === 'Outros')
  const receitasNaoCategorizada = categorized.filter(t => t.type === 'credit' && !t.detectedCategory)
  
  console.log(`📊 Resultados:`)
  console.log(`  ✅ ${categorizedTransactions.length} despesas categorizadas`)
  console.log(`  ❓ ${uncategorizedTransactions.length} como "Outros"`)
  console.log(`  💰 ${receitasNaoCategorizada.length} receitas mantidas sem categoria`)
  
  const successRate = despesas.length > 0 ? 
    (categorizedTransactions.length / despesas.length) * 100 : 0
  
  console.log(`🎯 Taxa de sucesso: ${successRate.toFixed(1)}% (apenas despesas)`)
  
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

// Re-exportar função de regras avançadas
export { applyAdvancedRules } 