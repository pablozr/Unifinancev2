import { categorizeTransactions, applyAdvancedRules, mapCategoriesToIds } from './categorizationRefactored'
import { ensureDefaultCategories } from '../_data/getDefaultCategories'
import { ProcessedTransaction } from '../_types/types'
import { v4 as uuidv4 } from 'uuid'
import { parseDateBR } from '@/lib/utils/validDate'

export interface CategorizationResult {
  success: boolean
  error?: string
  categorizedTransactions?: ProcessedTransaction[]
}

export default async function processAutoCategorization(
  validatedTransactions: any[],
  userId: string
): Promise<CategorizationResult> {
  try {
    
    const userCategories = await ensureDefaultCategories(userId)
    
    let categorizedTransactions = categorizeTransactions(validatedTransactions)
    categorizedTransactions = applyAdvancedRules(categorizedTransactions)
    categorizedTransactions = mapCategoriesToIds(categorizedTransactions, userCategories)
    
    const processedTransactions: ProcessedTransaction[] = categorizedTransactions.map(transaction => {
      const parsedDate = parseDateBR(transaction.date)
      if (!parsedDate) {
        throw new Error(`Data invÃ¡lida: ${transaction.date}`)
      }
      
      return {
        id: uuidv4(),
        date: parsedDate,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        detectedCategory: transaction.detectedCategory,
        categoryConfidence: transaction.categoryConfidence,
        categoryId: transaction.categoryId,
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear()
      }
    })

    return {
      success: true,
      categorizedTransactions: processedTransactions
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro na categorizaÃ§Ã£o: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
} 
