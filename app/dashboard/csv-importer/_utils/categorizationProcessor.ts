import groqCategorization from '../../_ai/categorization/groqCategorizer'
import { mapCategoriesToIds } from './categorizationRefactored'
import { ensureDefaultCategories } from '../_data/getDefaultCategories'
import { ProcessedTransaction } from '../_types/types'
import type { AIStats } from '../../_ai/types/aiTypes'
import { v4 as uuidv4 } from 'uuid'
import { parseDateBR } from '@/lib/utils/validDate'

export interface CategorizationResult {
  success: boolean
  error?: string
  categorizedTransactions?: ProcessedTransaction[]
  aiStats?: AIStats
}

export default async function processAutoCategorization(
  validatedTransactions: any[],
  userId: string
): Promise<CategorizationResult> {
  try {
    console.log(`🎯 Iniciando categorização com IA para ${validatedTransactions.length} transações...`)
    
    // Garantir que o usuário tem categorias padrão
    const userCategories = await ensureDefaultCategories(userId)
    console.log(`📋 Categorias do usuário: ${userCategories.map(c => c.name).join(', ')}`)
    
    // Categorização com Groq
    const { transactions: categorizedTransactions, stats } = await groqCategorization(
      validatedTransactions, 
      userCategories
    )
    
    // Normalizar datas (manter formato BR) e mapear categorias para IDs do banco de dados
    const normalizedTransactions = categorizedTransactions.map(t => ({
      ...t,
      date: typeof t.date === 'string' ? t.date : t.date.toLocaleDateString('pt-BR'),
      type: t.type as "credit" | "debit"
    }))
    const transactionsWithIds = mapCategoriesToIds(normalizedTransactions, userCategories)
    
    // Transformar para formato final do ProcessedTransaction
    const processedTransactions: ProcessedTransaction[] = transactionsWithIds.map(transaction => {
      let parsedDate: Date | null = null
      
      // Parsear data
      if (transaction.date && typeof transaction.date === 'object' && 'getTime' in transaction.date) {
        parsedDate = transaction.date as Date
      } else if (typeof transaction.date === 'string') {
        parsedDate = parseDateBR(transaction.date)
      }
      
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error(`Data inválida: ${transaction.date}`)
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

    console.log(`✅ Categorização concluída com sucesso!`)
    console.log(`📊 Stats: ${stats.aiProcessed}/${stats.totalTransactions} processadas, ${stats.averageConfidence}% confiança média`)

    return {
      success: true,
      categorizedTransactions: processedTransactions,
      aiStats: stats
    }
    
  } catch (error) {
    console.error('❌ Erro na categorização:', error)
    return {
      success: false,
      error: `Erro na categorização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}