import { createClient } from '@/lib/supabase/server'
import { ProcessedTransaction } from '../_types/types'
import { formatDateForDB } from '@/lib/utils/validDate'

export interface SaveTransactionsResult {
  success: boolean
  error?: string
  transactionsCount?: number
}

export default async function saveTransactions(
  transactions: ProcessedTransaction[],
  userId: string,
  importId: string
): Promise<SaveTransactionsResult> {
  try {
    const supabase = await createClient()
    
    console.log('💾 Salvando transações no banco...')
    
    const transactionsToInsert = transactions.map(transaction => ({
      id: transaction.id,
      user_id: userId,
      csv_import_id: importId,
      date: formatDateForDB(transaction.date),
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.detectedCategory || transaction.category || 'Outros',
      category_id: transaction.categoryId,
      month: transaction.month,
      year: transaction.year,
      created_at: new Date().toISOString()
    }))

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)

    if (transactionError) {
      console.error('❌ Erro ao salvar transações:', transactionError)
      
      // Limpar registro de import se falhou
      await supabase
        .from('csv_imports')
        .delete()
        .eq('id', importId)
      
      return { 
        success: false, 
        error: `Erro ao salvar transações: ${transactionError.message}` 
      }
    }

    // Atualizar status do import para concluído
    await supabase
      .from('csv_imports')
      .update({ status: 'completed' })
      .eq('id', importId)

    console.log('📊 Transações salvas:', transactionsToInsert.length)

    return {
      success: true,
      transactionsCount: transactionsToInsert.length
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro ao salvar transações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
} 