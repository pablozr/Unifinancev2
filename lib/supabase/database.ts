/**
 * @fileoverview Database client unificado usando Supabase
 * @description Substitui o Prisma Client com funÃ§Ãµes otimizadas do Supabase
 */

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

/**
 * @function getSupabaseClient
 * @description Cria uma instÃ¢ncia do cliente Supabase para operaÃ§Ãµes de leitura no servidor
 */
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * @interface TransactionQuery
 * @description Interface para configurar queries de transaÃ§Ãµes
 */
export interface TransactionQuery {
  userId: string
  transactionType?: 'credit' | 'debit' | 'all'
  dateRange?: { start: Date; end: Date }
  includeCategories?: boolean
  orderBy?: 'date' | 'amount' | 'description'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * @class DatabaseService  
 * @description ServiÃ§o de banco de dados usando Supabase
 */
export class DatabaseService {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  /**
   * @method findManyTransactions
   * @description Busca transaÃ§Ãµes com filtros flexÃ­veis
   */
  async findManyTransactions(config: TransactionQuery) {
    let query = this.supabase
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

    if (error) {throw new Error(`Erro ao buscar transaÃ§Ãµes: ${error.message}`)}
    return data || []
  }

  /**
   * @method countTransactions
   * @description Conta transaÃ§Ãµes com filtros
   */
  async countTransactions(config: Omit<TransactionQuery, 'includeCategories' | 'orderBy' | 'orderDirection' | 'limit' | 'offset'>) {
    let query = this.supabase
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

    if (error) {throw new Error(`Erro ao contar transaÃ§Ãµes: ${error.message}`)}
    return count || 0
  }

  /**
   * @method findAllUserTransactions
   * @description Busca todas as transaÃ§Ãµes de um usuÃ¡rio
   */
  async findAllUserTransactions(
    userId: string, 
    options: {
      includeCategories?: boolean
      orderBy?: 'date' | 'amount'
      orderDirection?: 'asc' | 'desc'
    } = {}
  ) {
    let query = this.supabase
      .from('transactions')
      .select(options.includeCategories 
        ? '*, categories(name, color)' 
        : '*'
      )
      .eq('user_id', userId)

    const orderBy = options.orderBy || 'date'
    const ascending = options.orderDirection === 'asc'
    query = query.order(orderBy, { ascending })

    const { data, error } = await query

    if (error) {throw new Error(`Erro ao buscar todas as transaÃ§Ãµes: ${error.message}`)}
    return data || []
  }

  /**
   * @method findTransactionsByDateRange
   * @description Busca transaÃ§Ãµes por range de datas
   */
  async findTransactionsByDateRange(
    userId: string,
    dateRange: { start: Date; end: Date },
    options: {
      includeCategories?: boolean
      transactionType?: 'credit' | 'debit' | 'all'
    } = {}
  ) {
    let query = this.supabase
      .from('transactions')
      .select(options.includeCategories 
        ? '*, categories(name, color)' 
        : '*'
      )
      .eq('user_id', userId)
      .gte('date', dateRange.start.toISOString())
      .lte('date', dateRange.end.toISOString())

    if (options.transactionType && options.transactionType !== 'all') {
      query = query.eq('type', options.transactionType)
    }

    query = query.order('date', { ascending: false })

    const { data, error } = await query

    if (error) {throw new Error(`Erro ao buscar transaÃ§Ãµes por data: ${error.message}`)}
    return data || []
  }

  /**
   * @method deleteManyTransactions
   * @description Remove mÃºltiplas transaÃ§Ãµes
   */
  async deleteManyTransactions(where: { user_id: string; id?: { in: string[] } }) {
    let query = this.supabase
      .from('transactions')
      .delete()
      .eq('user_id', where.user_id)

    if (where.id?.in) {
      query = query.in('id', where.id.in)
    }

    const { error, count } = await query

    if (error) {throw new Error(`Erro ao deletar transaÃ§Ãµes: ${error.message}`)}
    return { count: count || 0 }
  }

  /**
   * @method findManyCategories
   * @description Busca categorias do usuÃ¡rio
   */
  async findManyCategories(userId: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) {throw new Error(`Erro ao buscar categorias: ${error.message}`)}
    return data || []
  }

  /**
   * @method disconnect
   * @description MÃ©todo de compatibilidade (nÃ£o necessÃ¡rio no Supabase)
   */
  async disconnect() {
    return Promise.resolve()
  }
}

/**
 * @function createDatabaseService
 * @description Factory para criar o serviÃ§o de banco de dados
 */
export function createDatabaseService(): DatabaseService {
  const supabase = getSupabaseClient()
  return new DatabaseService(supabase)
}

/**
 * @constant database
 * @description InstÃ¢ncia global do serviÃ§o de banco (equivalente ao prisma)
 */
let _database: DatabaseService | null = null

export function getDatabase(): DatabaseService {
  if (!_database) {
    _database = createDatabaseService()
  }
  return _database
}

export { getDatabase as database } 
