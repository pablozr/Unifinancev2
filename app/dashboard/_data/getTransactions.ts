import { createClient } from '@/lib/supabase/server'

interface TransactionQuery {
  userId: string
  transactionType?: 'credit' | 'debit' | 'all'
  dateRange?: { start: Date; end: Date }
  includeCategories?: boolean
  orderBy?: 'date' | 'amount' | 'description'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export default async function getTransactions(config: TransactionQuery) {
  const supabase = await createClient()
  
  let query = supabase
    .from('transactions')
    .select(config.includeCategories 
      ? '*, categories(name, color)' 
      : '*'
    )
    .eq('user_id', config.userId)

  if (config.transactionType && config.transactionType !== 'all') {
    query = query.eq('type', config.transactionType)
  }

  if (config.dateRange) {
    query = query
      .gte('date', config.dateRange.start.toISOString())
      .lte('date', config.dateRange.end.toISOString())
  }

  const orderBy = config.orderBy || 'date'
  const ascending = config.orderDirection === 'asc'
  query = query.order(orderBy, { ascending })

  if (config.limit) {
    query = query.limit(config.limit)
  }
  if (config.offset) {
    query = query.range(config.offset, config.offset + (config.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {throw new Error(`Erro ao buscar transações: ${error.message}`)}
  return data || []
} 