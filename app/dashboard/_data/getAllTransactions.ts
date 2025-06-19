'use server'
import { cache } from 'react'
import type { PaginatedTransactions, PeriodFilter } from './types'
import { queryTransactions, countTransactions } from './utils/queryBuilder'
import { transformTransaction } from './utils/calculationUtils'

/**
 * @function getAllTransactions
 * @description Busca transações paginadas
 */
const getAllTransactions = cache(async (
  userId: string,
  page = 1,
  limit = 10,
  filter?: PeriodFilter
): Promise<PaginatedTransactions> => {
  const offset = (page - 1) * limit

  const [totalCount, transactions] = await Promise.all([
    countTransactions({ userId, filter }),
    queryTransactions({
      userId,
      filter,
      includeCategories: true,
      limit,
      offset,
      orderBy: 'date',
      orderDirection: 'desc'
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    transactions: transactions.map(transformTransaction),
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  }
})

export default getAllTransactions 