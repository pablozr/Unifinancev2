'use server'

import { validateUser, applyFiltersToQuery, calculateTransactionImpact, revalidateDashboardPaths } from './utils'
import type { DeleteFilters, DeleteResult } from './types'

/**
 * Deleta transações baseado nos filtros fornecidos
 */
export default async function deleteByFilters(
  userId: string,
  filters: DeleteFilters
): Promise<DeleteResult> {
  const { supabase } = await validateUser(userId)

  let query = supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)

  query = applyFiltersToQuery(query, filters)

  const { data: transactions, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar transações: ${error.message}`)
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

  const transactionIds = transactions.map(t => t.id)
  
  const { error: deleteError, count } = await supabase
    .from('transactions')
    .delete()
    .in('id', transactionIds)
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