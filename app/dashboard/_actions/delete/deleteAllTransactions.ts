'use server'

import { validateUser, calculateTransactionImpact, revalidateDashboardPaths } from './utils'
import type { DeleteResult } from './types'

/**
 * Deleta TODAS as transações do usuário
 */
export default async function deleteAllTransactions(userId: string): Promise<DeleteResult> {
  console.log('🗑️ ATENÇÃO: Deletando TODAS as transações do usuário:', userId)
  
  const { supabase } = await validateUser(userId)

  // Primeiro buscar todas as transações para calcular impacto
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)

  if (fetchError) {
    console.error('❌ Erro ao buscar transações:', fetchError)
    throw new Error(`Erro ao buscar transações: ${fetchError.message}`)
  }

  console.log('📊 Total de transações do usuário:', transactions?.length || 0)

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ Usuário não possui transações')
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

  // Calcular impacto
  const breakdown = calculateTransactionImpact(transactions)
  console.log('💰 Impacto total:', breakdown)

  // Deletar TODAS as transações
  const { error: deleteError, count } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('❌ Erro ao deletar transações:', deleteError)
    throw new Error(`Erro ao deletar transações: ${deleteError.message}`)
  }

  console.log('✅ Todas as transações deletadas:', count || 0)

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