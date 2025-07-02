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

  // Limpar despesas recorrentes órfãs após deletar transações
  console.log('🗑️ [deleteByFilters] Limpando despesas recorrentes órfãs...')
  
  try {
    const { data: allRecurring } = await supabase
      .from('recurringexpenses')
      .select('id')
      .eq('user_id', userId)

    if (allRecurring) {
      for (const recurring of allRecurring) {
        const { data: linkedTransactions } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('recurring_expense_id', recurring.id)
          .limit(1)

        if (!linkedTransactions || linkedTransactions.length === 0) {
          await supabase
            .from('recurringexpenses')
            .delete()
            .eq('id', recurring.id)
          console.log(`🗑️ [deleteByFilters] Despesa recorrente órfã removida: ${recurring.id}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ [deleteByFilters] Erro ao limpar despesas órfãs:', error)
  }

  // Limpar registros de import órfãos (que não têm mais transações)
  console.log('🗑️ [deleteByFilters] Limpando registros de import órfãos...')
  
  try {
    const { data: allImports } = await supabase
      .from('csv_imports')
      .select('id')
      .eq('user_id', userId)

    if (allImports) {
      for (const importRecord of allImports) {
        const { data: linkedTransactions } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('csv_import_id', importRecord.id)
          .limit(1)

        if (!linkedTransactions || linkedTransactions.length === 0) {
          console.log(`🗑️ [deleteByFilters] Removendo import órfão: ${importRecord.id}`)
          await supabase
            .from('csv_imports')
            .delete()
            .eq('id', importRecord.id)
            .eq('user_id', userId)
        }
      }
    }
  } catch (error) {
    console.error('❌ [deleteByFilters] Erro ao limpar imports órfãos:', error)
  }

  revalidateDashboardPaths()

  const result = {
    deleted: count || transactions.length,
    totalImpact: breakdown.creditAmount - breakdown.debitAmount,
    breakdown
  }

  return result
} 