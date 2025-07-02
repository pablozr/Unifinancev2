'use server'

import { validateUser, calculateTransactionImpact, revalidateDashboardPaths } from './utils'
import type { DeleteResult } from './types'

/**
 * Deleta TODAS as transações do usuário
 */
export default async function deleteAllTransactions(userId: string): Promise<DeleteResult> {
  const { supabase } = await validateUser(userId)

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)

  if (fetchError) {
    throw new Error(`Erro ao buscar transações: ${fetchError.message}`)
  }

  if (!transactions || transactions.length === 0) {
    return {
      deleted: 0,
      totalImpact: 0,
      breakdown: {
        credits: 0,
        debits: 0,
        creditAmount: 0,
        debitAmount: 0
      }
    }
  }

  const breakdown = calculateTransactionImpact(transactions)

  const { error: deleteError, count } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    throw new Error(`Erro ao deletar transações: ${deleteError.message}`)
  }

  // Deletar todas as despesas recorrentes do usuário também
  console.log('🗑️ [deleteAllTransactions] Deletando despesas recorrentes...')
  const { error: recurringDeleteError } = await supabase
    .from('recurringexpenses')
    .delete()
    .eq('user_id', userId)

  if (recurringDeleteError) {
    console.error('❌ [deleteAllTransactions] Erro ao deletar despesas recorrentes:', recurringDeleteError)
    // Não falhar a operação, apenas log do erro
  } else {
    console.log('✅ [deleteAllTransactions] Despesas recorrentes deletadas com sucesso')
  }

  // Deletar sugestões de despesas recorrentes também
  console.log('🗑️ [deleteAllTransactions] Deletando sugestões recorrentes...')
  const { error: suggestionsDeleteError } = await supabase
    .from('recurringsuggestions')
    .delete()
    .eq('user_id', userId)

  if (suggestionsDeleteError) {
    console.error('❌ [deleteAllTransactions] Erro ao deletar sugestões recorrentes:', suggestionsDeleteError)
    // Não falhar a operação, apenas log do erro
  } else {
    console.log('✅ [deleteAllTransactions] Sugestões recorrentes deletadas com sucesso')
  }

  // Deletar todos os registros de import do usuário também
  console.log('🗑️ [deleteAllTransactions] Deletando registros de import...')
  const { error: importsDeleteError } = await supabase
    .from('csv_imports')
    .delete()
    .eq('user_id', userId)

  if (importsDeleteError) {
    console.error('❌ [deleteAllTransactions] Erro ao deletar imports:', importsDeleteError)
    // Não falhar a operação, apenas log do erro
  } else {
    console.log('✅ [deleteAllTransactions] Registros de import deletados com sucesso')
  }

  revalidateDashboardPaths()

  const result = {
    deleted: count || transactions.length,
    totalImpact: breakdown.creditAmount - breakdown.debitAmount,
    breakdown
  }

  return result
} 