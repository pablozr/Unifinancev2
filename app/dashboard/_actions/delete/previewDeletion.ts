'use server'

import { validateUser, applyFiltersToQuery } from './utils'
import type { DeleteFilters, PreviewDeletionResult } from './types'

/**
 * Visualiza quantas transaÃ§Ãµes seriam deletadas com os filtros aplicados
 */
export async function previewDeletionByFilters(
  userId: string,
  filters: DeleteFilters
): Promise<PreviewDeletionResult> {
  const { supabase } = await validateUser(userId)

  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)

  query = applyFiltersToQuery(query, filters)

  const { data: transactions, error } = await query

  if (error) {
    throw new Error(`Erro ao buscar transaÃ§Ãµes: ${error.message}`)
  }

  if (!transactions) {
    return { count: 0, totalAmount: 0 }
  }

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    count: transactions.length,
    totalAmount
  }
}

/**
 * Visualiza quantas transaÃ§Ãµes seriam deletadas em um perÃ­odo
 */
export async function previewDeletionByPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PreviewDeletionResult> {
  const { supabase } = await validateUser(userId)

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr)

  if (error) {
    throw new Error(`Erro ao buscar transaÃ§Ãµes: ${error.message}`)
  }

  if (!transactions) {
    return { count: 0, totalAmount: 0 }
  }

  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    count: transactions.length,
    totalAmount
  }
} 
