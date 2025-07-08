'use client'

import { createClient } from '@/lib/supabase/client'

interface TransactionQuery {
  userId: string
  transactionType?: 'credit' | 'debit' | 'all'
  dateRange?: { start: Date; end: Date }
  orderBy?: 'date' | 'amount' | 'description'
  orderDirection?: 'asc' | 'desc'
  page?: number
  limit?: number
}

const PAGE_LIMIT = 50;

export async function getTransactionsClient(config: TransactionQuery) {
  const supabase = createClient()
  const page = config.page || 1;
  const limit = config.limit || PAGE_LIMIT;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let countQuery = supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true }) // head:true evita retorno de dados e garante contagem precisa
    .eq('user_id', config.userId)

  if (config.transactionType && config.transactionType !== 'all') {
    countQuery = countQuery.eq('type', config.transactionType)
  }

  if (config.dateRange) {
    countQuery = countQuery
      .gte('date', config.dateRange.start.toISOString())
      .lte('date', config.dateRange.end.toISOString())
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    console.error('Error fetching transactions count:', countError)
    return { data: [], count: 0 }
  }

  // 2. Get the paginated data
  let dataQuery = supabase.from('transactions').select('*').eq('user_id', config.userId)

  if (config.transactionType && config.transactionType !== 'all') {
    dataQuery = dataQuery.eq('type', config.transactionType)
  }
  if (config.dateRange) {
    dataQuery = dataQuery
      .gte('date', config.dateRange.start.toISOString())
      .lte('date', config.dateRange.end.toISOString())
  }

  const orderBy = config.orderBy || 'date';
  const ascending = config.orderDirection === 'asc';
  
  const { data, error: dataError } = await dataQuery
    .order(orderBy, { ascending })
    .range(from, to);

  if (dataError) {
    console.error('Error fetching transactions client-side:', dataError)
    return { data: [], count: count || 0 }
  }
  
  return { data: data || [], count: count || 0 }
} 