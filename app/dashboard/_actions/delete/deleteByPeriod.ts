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
  console.log('🗑️ Iniciando exclusão por período...')
  console.log('📅 Período:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() })
  
  const { supabase } = await validateUser(userId)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Buscar transações do período
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, amount, type, date, description')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

  if (fetchError) {
    console.error('❌ Erro ao buscar transações:', fetchError)
    throw new Error(`Erro ao buscar transações: ${fetchError.message}`)
  }

  console.log('📊 Transações encontradas no período:', transactions?.length || 0)

  if (!transactions || transactions.length === 0) {
    console.log('⚠️ Nenhuma transação encontrada no período')
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
  console.log('💰 Impacto calculado:', breakdown)

  // Deletar transações
  const { error: deleteError, count } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

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