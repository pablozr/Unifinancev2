import groqService from '../services/groqService'
import { AICategorizedTransaction, AIStats } from '../types/aiTypes'
import { RawBankStatement } from '../../csv-importer/_types/types'

export default async function groqCategorization(
    transactions: RawBankStatement[],
    userCategories: Array<{ id: string; name: string }>
): Promise<{ 
  transactions: AICategorizedTransaction[], 
  stats: AIStats 
}> {
    const start = Date.now()
    const availableCategories = userCategories.map(c => c.name)

    console.log(`🚀 Groq: iniciando categorização de ${transactions.length} transações...`)
    console.log(`📋 Categorias disponíveis: ${availableCategories.join(', ')}`)

    const isAvailable = await groqService.isAvailable()
    if (!isAvailable) {
        console.error('🚨 Groq não disponível')
        
        const fallbackTransactions = transactions.map(transaction => ({
            ...transaction,
            detectedCategory: 'Outros',
            categoryConfidence: 15,
            aiReasoning: 'API não disponível',
            aiUsed: false,
        }))

        return {
            transactions: fallbackTransactions,
            stats: {
              totalTransactions: transactions.length,
              aiProcessed: 0,
              averageConfidence: 10,
              processingTime: Date.now() - start,
              failedTransactions: transactions.length,
              apiProvider: 'groq-fallback'
            }
        }
    }

    const batchSize = 12
    const results: AICategorizedTransaction[] = []
    let totalAiProcessed = 0
    let totalConfidence = 0


    for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(transactions.length / batchSize)
        
        console.log(`🔄 Processando lote ${batchNumber}/${totalBatches} (${batch.length} transações)...`)
        
        const batchForAI = batch.map(t => ({
          description: t.description,
          amount: t.amount,
          type: t.type
        }))

        try {
            const aiResults = await groqService.categorizeBatch(batchForAI, availableCategories)

            batch.forEach((transaction, batchIndex) => {
                const aiResult = aiResults[batchIndex]
        
        const categorizedTransaction: AICategorizedTransaction = {
          ...transaction,
          detectedCategory: aiResult?.category || 'Outros',
          categoryConfidence: aiResult?.confidence || 15,
          aiReasoning: aiResult?.reasoning || 'Erro no processamento',
          aiUsed: aiResult !== null && aiResult.confidence > 0
        }
        
        results.push(categorizedTransaction)
        
        if (categorizedTransaction.aiUsed) {
          totalAiProcessed++
          totalConfidence += categorizedTransaction.categoryConfidence || 0
        }
      })
      
      console.log(`✅ Lote ${batchNumber} processado com sucesso`)
      
    } catch (error) {
      console.error(`❌ Erro no lote ${batchNumber}:`, error)
      
      // Fallback para o lote que falhou
      batch.forEach(transaction => {
        results.push({
          ...transaction,
          detectedCategory: 'Outros',
          categoryConfidence: 10,
          aiReasoning: 'Erro no processamento do lote',
          aiUsed: false
        })
      })
    }

    // Pequena pausa entre lotes para não sobrecarregar API
    if (i + batchSize < transactions.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    const processingTime = Date.now() - start
  const averageConfidence = totalAiProcessed > 0 ? Math.round(totalConfidence / totalAiProcessed) : 0
  const failedTransactions = transactions.length - totalAiProcessed
  
  const stats: AIStats = {
    totalTransactions: transactions.length,
    aiProcessed: totalAiProcessed,
    averageConfidence,
    processingTime,
    failedTransactions,
    apiProvider: 'groq'
  }
  
  console.log(`🎉 Groq categorização concluída:`)
  console.log(`   • Tempo total: ${processingTime}ms`)
  console.log(`   • Processadas com IA: ${totalAiProcessed}/${transactions.length}`)
  console.log(`   • Confiança média: ${averageConfidence}%`)
  console.log(`   • Transações com falha: ${failedTransactions}`)
  
  return { transactions: results, stats }
}