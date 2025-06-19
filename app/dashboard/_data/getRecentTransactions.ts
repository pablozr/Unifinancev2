'use server'
import { cache } from 'react'
import type { RecentTransaction, PeriodFilter } from './types'
import { queryTransactions } from './utils/queryBuilder'
import { transformTransaction } from './utils/calculationUtils'

/**
 * @function getRecentTransactions
 * @description Busca transações recentes
 */
const getRecentTransactions = cache(async (
  userId: string,
  limit = 4,
  filter?: PeriodFilter
): Promise<RecentTransaction[]> => {
  const transactions = await queryTransactions({
    userId,
    filter,
    includeCategories: true,
    limit,
    orderBy: 'date',
    orderDirection: 'desc'
  })

  return transactions.map(transformTransaction)
})

export default getRecentTransactions 