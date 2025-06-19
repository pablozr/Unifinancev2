import { createClient } from '@/lib/supabase/server'

interface CountQuery {
  userId: string
  transactionType?: 'credit' | 'debit' | 'all'
  dateRange?: { start: Date; end: Date }
}

export default async function getTransactionCount(config: CountQuery) {
  const supabase = await createClient()
  
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', config.userId)

  if (config.transactionType && config.transactionType !== 'all') {
    query = query.eq('type', config.transactionType)
  }

  if (config.dateRange) {
    query = query
      .gte('date', config.dateRange.start.toISOString())
      .lte('date', config.dateRange.end.toISOString())
  }

  const { count, error } = await query

  if (error) {throw new Error(`Erro ao contar transações: ${error.message}`)}
  return count || 0
} 