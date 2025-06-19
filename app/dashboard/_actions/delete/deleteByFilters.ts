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
  console.log('🗑️ Iniciando exclusão de transações para userId:', userId)
  console.log('🔍 Filtros aplicados:', filters)
  
  const { supabase } = await validateUser(userId)

  let query = supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)

  // Aplicar filtros
  query = applyFiltersToQuery(query, filters)

  const { data: transactions, error } = await query

  if (error) {
    console.error('❌ Erro ao buscar transações:', error)
    throw new Error(`Erro ao buscar transações: ${error.message}`)
  }

  console.log('📊 Transações encontradas:', transactions?.length || 0)
  if (transactions && transactions.length > 0) {
    console.log('📋 Primeiras 3 transações:', transactions.slice(0, 3))
  }

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ Nenhuma transação encontrada para deletar')
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

  // Calcular impacto antes da exclusão
  const breakdown = calculateTransactionImpact(transactions)
  console.log('💰 Impacto calculado:', breakdown)

  // Deletar transações
  const transactionIds = transactions.map(t => t.id)
  console.log('🗑️ IDs para deletar:', transactionIds.length, 'transações')
  
  const { error: deleteError, count } = await supabase
    .from('transactions')
    .delete()
    .in('id', transactionIds)
    .eq('user_id', userId) // Segurança extra

  if (deleteError) {
    console.error('❌ Erro ao deletar transações:', deleteError)
    throw new Error(`Erro ao deletar transações: ${deleteError.message}`)
  }

  console.log('✅ Transações deletadas:', count || 0)

  // Revalidar caches
  revalidateDashboardPaths()

  const result = {
    deleted: count || transactions.length,
    totalImpact: breakdown.creditAmount - breakdown.debitAmount,
    breakdown
  }

  console.log('📊 Resultado final:', result)
  return result
} 