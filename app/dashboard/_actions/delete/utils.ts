import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { DeleteFilters } from './types'

/**
 * Valida autenticação do usuário
 */
export async function validateUser(userId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || (userId && user.id !== userId)) {
    console.error('❌ Erro de validação de usuário:', authError)
    throw new Error('Usuário não autorizado')
  }
  
  return { supabase, user }
}

/**
 * Aplica filtros na query de busca
 */
export function applyFiltersToQuery(query: any, filters: DeleteFilters) {
  if (filters.dateRange) {
    const startDate = filters.dateRange.start.toISOString().split('T')[0]
    const endDate = filters.dateRange.end.toISOString().split('T')[0]
    console.log('📅 Filtro de data:', { startDate, endDate })
    query = query.gte('date', startDate).lte('date', endDate)
  }

  if (filters.type) {
    console.log('🏷️ Filtro de tipo:', filters.type)
    query = query.eq('type', filters.type)
  }

  if (filters.description) {
    console.log('📝 Filtro de descrição:', filters.description)
    query = query.ilike('description', `%${filters.description}%`)
  }

  if (filters.category) {
    console.log('🏷️ Filtro de categoria:', filters.category)
    query = query.eq('category', filters.category)
  }

  if (filters.amountRange) {
    console.log('💰 Filtro de valor:', filters.amountRange)
    query = query.gte('amount', filters.amountRange.min).lte('amount', filters.amountRange.max)
  }

  return query
}

/**
 * Calcula o impacto das transações
 */
export function calculateTransactionImpact(transactions: any[]) {
  return transactions.reduce((acc, t) => {
    const amount = Number(t.amount)
    if (t.type === 'credit') {
      acc.credits++
      acc.creditAmount += amount
    } else if (t.type === 'debit') {
      acc.debits++
      acc.debitAmount += amount
    }
    return acc
  }, {
    credits: 0,
    debits: 0,
    creditAmount: 0,
    debitAmount: 0
  })
}

/**
 * Revalida caches do dashboard
 */
export function revalidateDashboardPaths() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/insights')
  revalidatePath('/dashboard/csv-importer')
} 