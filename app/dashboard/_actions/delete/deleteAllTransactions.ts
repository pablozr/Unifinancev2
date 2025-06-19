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

  revalidateDashboardPaths()

  const result = {
    deleted: count || transactions.length,
    totalImpact: breakdown.creditAmount - breakdown.debitAmount,
    breakdown
  }

  return result
} 