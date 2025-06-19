/**
 * @fileoverview Query builder centralizado
 * @description Factory de queries para eliminar duplicação e centralizar lógica
 */

import { getDatabase } from '@/lib/supabase/database'
import type { PeriodFilter, DateRange } from '../types'
import { getDateRangeFromFilter } from './dateUtils'
import { validateTransactionQuery, validateUserId, TransactionQuerySchema } from '../schemas'

/**
 * @interface TransactionQuery
 * @description Interface para configurar queries de transações
 */
interface TransactionQuery {
  userId: string
  filter?: PeriodFilter
  transactionType?: 'credit' | 'debit' | 'all'
  includeCategories?: boolean
  orderBy?: 'date' | 'amount' | 'description'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * @function buildTransactionWhereClause
 * @description Constrói cláusula WHERE padrão para transações
 * @param {TransactionQuery} config - Configuração da query
 * @returns {object} Configuração de query do Supabase
 */
export const buildTransactionWhereClause = (config: TransactionQuery) => {
  const queryConfig: any = {
    userId: config.userId
  }
  
  // Aplicar filtro de tipo de transação
  if (config.transactionType && config.transactionType !== 'all') {
    queryConfig.transactionType = config.transactionType
  }
  
  // Aplicar filtro de período
  if (config.filter) {
    const dateRange = getDateRangeFromFilter(config.filter)
    if (dateRange) {
      queryConfig.dateRange = dateRange
    }
  }
  
  return queryConfig
}

/**
 * @function queryTransactions
 * @description Query unificada para buscar transações com configurações flexíveis
 * @param {TransactionQuery} config - Configuração da query
 * @returns {Promise<any[]>} Array de transações
 */
export const queryTransactions = async (config: TransactionQuery) => {
  // Validar configuração de entrada
  const validatedConfig = validateTransactionQuery(config)
  const database = getDatabase()
  
  const queryConfig: any = {
    userId: validatedConfig.userId,
    transactionType: validatedConfig.transactionType,
    includeCategories: validatedConfig.includeCategories,
    orderBy: validatedConfig.orderBy || 'date',
    orderDirection: validatedConfig.orderDirection || 'desc',
    limit: validatedConfig.limit,
    offset: validatedConfig.offset
  }
  
  // Aplicar filtro de período
  if (validatedConfig.filter) {
    const dateRange = getDateRangeFromFilter(validatedConfig.filter)
    if (dateRange) {
      queryConfig.dateRange = dateRange
    }
  }
  
  return database.findManyTransactions(queryConfig)
}

/**
 * @function countTransactions
 * @description Conta transações baseado nos filtros
 * @param {TransactionQuery} config - Configuração da query
 * @returns {Promise<number>} Número de transações
 */
export const countTransactions = async (config: TransactionQuery) => {
  // Validar configuração de entrada
  const validatedConfig = validateTransactionQuery(config)
  const database = getDatabase()
  
  const queryConfig: any = {
    userId: validatedConfig.userId,
    transactionType: validatedConfig.transactionType
  }
  
  // Aplicar filtro de período
  if (validatedConfig.filter) {
    const dateRange = getDateRangeFromFilter(validatedConfig.filter)
    if (dateRange) {
      queryConfig.dateRange = dateRange
    }
  }
  
  return database.countTransactions(queryConfig)
}

/**
 * @function queryTransactionsByDateRange
 * @description Query otimizada para buscar transações por range de datas
 * @param {string} userId - ID do usuário
 * @param {DateRange} dateRange - Range de datas
 * @param {object} options - Opções adicionais
 * @returns {Promise<any[]>} Array de transações
 */
export const queryTransactionsByDateRange = async (
  userId: string, 
  dateRange: DateRange, 
  options: { 
    includeCategories?: boolean
    transactionType?: 'credit' | 'debit' | 'all'
  } = {}
) => {
  // Validar ID do usuário
  const validUserId = validateUserId(userId)
  const database = getDatabase()
  
  return database.findTransactionsByDateRange(validUserId, dateRange, options)
}

/**
 * @function queryAllUserTransactions
 * @description Query otimizada para buscar todas as transações do usuário
 * @param {string} userId - ID do usuário
 * @param {object} options - Opções adicionais
 * @returns {Promise<any[]>} Array de todas as transações
 */
export const queryAllUserTransactions = async (
  userId: string,
  options: {
    includeCategories?: boolean
    orderBy?: 'date' | 'amount'
    orderDirection?: 'asc' | 'desc'
  } = {}
) => {
  const database = getDatabase()
  return database.findAllUserTransactions(userId, options)
} 