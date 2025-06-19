'use server'

import { validateUser, calculateTransactionImpact, revalidateDashboardPaths } from './utils'
import type { DeleteResult } from './types'

/**
 * Deleta todas as transações em um período específico
 */
export default async function deleteByPeriod(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<DeleteResult> {
  const { supabase } = await validateUser(userId)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

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
    .gte('date', startDateStr)
    .lte('date', endDateStr)

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