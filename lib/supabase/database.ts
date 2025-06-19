/**
 * @fileoverview Database client unificado usando Supabase
 * @description Substitui o Prisma Client com funções otimizadas do Supabase
 */

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

/**
 * @function getSupabaseClient
 * @description Cria uma instância do cliente Supabase para operações de leitura no servidor
 */
export function getSupabaseClient() {
  // Para Server Components, usar service role para bypass RLS quando necessário
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
  
  // Para Client Components, usar browser client normal
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * @interface TransactionQuery
 * @description Interface para configurar queries de transações
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
 * @description Serviço de banco de dados usando Supabase
 */
export class DatabaseService {
  private supabase: any

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient
  }

  /**
   * @method findManyTransactions
   * @description Busca transações com filtros flexíveis
   */
  async findManyTransactions(config: TransactionQuery) {
    let query = this.supabase
      .from('transactions')
      .select(config.includeCategories 
        ? '*, categories(name, color)' 
        : '*'
      )
      .eq('user_id', config.userId)

    // Filtro por tipo
    if (config.transactionType && config.transactionType !== 'all') {
      query = query.eq('type', config.transactionType)
    }

    // Filtro por data
    if (config.dateRange) {
      query = query
        .gte('date', config.dateRange.start.toISOString())
        .lte('date', config.dateRange.end.toISOString())
    }

    // Ordenação
    const orderBy = config.orderBy || 'date'
    const ascending = config.orderDirection === 'asc'
    query = query.order(orderBy, { ascending })

    // Paginação
    if (config.limit) {
      query = query.limit(config.limit)
    }
    if (config.offset) {
      query = query.range(config.offset, config.offset + (config.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) throw new Error(`Erro ao buscar transações: ${error.message}`)
    return data || []
  }

  /**
   * @method countTransactions
   * @description Conta transações com filtros
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

    if (error) throw new Error(`Erro ao contar transações: ${error.message}`)
    return count || 0
  }

  /**
   * @method findAllUserTransactions
   * @description Busca todas as transações de um usuário
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

    if (error) throw new Error(`Erro ao buscar todas as transações: ${error.message}`)
    return data || []
  }

  /**
   * @method findTransactionsByDateRange
   * @description Busca transações por range de datas
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

    if (error) throw new Error(`Erro ao buscar transações por data: ${error.message}`)
    return data || []
  }

  /**
   * @method deleteManyTransactions
   * @description Remove múltiplas transações
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

    if (error) throw new Error(`Erro ao deletar transações: ${error.message}`)
    return { count: count || 0 }
  }

  /**
   * @method findManyCategories
   * @description Busca categorias do usuário
   */
  async findManyCategories(userId: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`)
    return data || []
  }

  /**
   * @method disconnect
   * @description Método de compatibilidade (não necessário no Supabase)
   */
  async disconnect() {
    // Supabase não precisa de disconnect explícito
    return Promise.resolve()
  }
}

/**
 * @function createDatabaseService
 * @description Factory para criar o serviço de banco de dados
 */
export function createDatabaseService(): DatabaseService {
  const supabase = getSupabaseClient()
  return new DatabaseService(supabase)
}

/**
 * @constant database
 * @description Instância global do serviço de banco (equivalente ao prisma)
 */
let _database: DatabaseService | null = null

export function getDatabase(): DatabaseService {
  if (!_database) {
    _database = createDatabaseService()
  }
  return _database
}

// Export para compatibilidade com código existente
export { getDatabase as database } 