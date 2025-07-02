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

  // Deletar despesas recorrentes órfãs (que não têm mais transações vinculadas)
  console.log('🗑️ [deleteByPeriod] Limpando despesas recorrentes órfãs...')
  
  try {
    // Buscar despesas recorrentes que não têm mais transações vinculadas
    const { data: orphanRecurring } = await supabase
      .rpc('delete_orphaned_recurring_expenses', { user_id_param: userId })

    if (orphanRecurring) {
      console.log(`✅ [deleteByPeriod] ${orphanRecurring} despesas recorrentes órfãs removidas`)
    }
  } catch (error) {
    // Se a função RPC não existir, fazer manualmente
    console.log('🔄 [deleteByPeriod] Fazendo limpeza manual de despesas órfãs...')
    
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
        }
      }
    }
  }

  // Limpar registros de import órfãos (que não têm mais transações)
  console.log('🗑️ [deleteByPeriod] Limpando registros de import órfãos...')
  
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
          console.log(`🗑️ [deleteByPeriod] Removendo import órfão: ${importRecord.id}`)
          await supabase
            .from('csv_imports')
            .delete()
            .eq('id', importRecord.id)
            .eq('user_id', userId)
        }
      }
    }
  } catch (error) {
    console.error('❌ [deleteByPeriod] Erro ao limpar imports órfãos:', error)
  }

  revalidateDashboardPaths()

  const result = {
    deleted: count || transactions.length,
    totalImpact: breakdown.creditAmount - breakdown.debitAmount,
    breakdown
  }

  return result
} 