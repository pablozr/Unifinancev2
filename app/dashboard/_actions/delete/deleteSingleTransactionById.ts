'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardPaths } from './utils'
import type { DeleteTransactionResult } from './types'

/**
 * Deleta uma única transação por ID
 */
export default async function deleteSingleTransactionById(
  transactionId: string
): Promise<DeleteTransactionResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (!transactionId || !transactionId.trim()) {
      return { success: false, error: 'ID da transação é obrigatório' }
    }

    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, description, amount, type, recurring_expense_id, csv_import_id')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (findError) {
      return { success: false, error: 'Transação não encontrada ou sem permissão' }
    }

    if (!transaction) {
      return { success: false, error: 'Transação não encontrada' }
    }

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { success: false, error: `Erro ao deletar transação: ${deleteError.message}` }
    }

    // Se a transação estava vinculada a uma despesa recorrente, verificar se deve ser removida
    if (transaction.recurring_expense_id) {
      console.log('🔍 [deleteSingleTransaction] Verificando se despesa recorrente ficou órfã...')
      
      const { data: remainingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('recurring_expense_id', transaction.recurring_expense_id)
        .limit(1)

      if (!remainingTransactions || remainingTransactions.length === 0) {
        console.log('🗑️ [deleteSingleTransaction] Removendo despesa recorrente órfã...')
        await supabase
          .from('recurringexpenses')
          .delete()
          .eq('id', transaction.recurring_expense_id)
          .eq('user_id', user.id)
        console.log('✅ [deleteSingleTransaction] Despesa recorrente órfã removida')
      }
    }

    // Se a transação estava vinculada a um import, verificar se deve ser removido
    if (transaction.csv_import_id) {
      console.log('🔍 [deleteSingleTransaction] Verificando se import ficou órfão...')
      
      const { data: remainingTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('csv_import_id', transaction.csv_import_id)
        .limit(1)

      if (!remainingTransactions || remainingTransactions.length === 0) {
        console.log('🗑️ [deleteSingleTransaction] Removendo import órfão...')
        await supabase
          .from('csv_imports')
          .delete()
          .eq('id', transaction.csv_import_id)
          .eq('user_id', user.id)
        console.log('✅ [deleteSingleTransaction] Import órfão removido')
      }
    }

    revalidateDashboardPaths()

    return { 
      success: true, 
      transactionId: transactionId 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Erro inesperado ao deletar transação'
    }
  }
} 