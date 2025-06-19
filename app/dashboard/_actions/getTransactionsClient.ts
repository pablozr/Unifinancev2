'use server'

import { getAllTransactions } from '../_data'
import type { PeriodFilter } from '../_data/types'

export async function getTransactionsClient(
  userId: string, 
  page: number = 1, 
  limit: number = 10, 
  filter?: PeriodFilter
) {
  try {
    return await getAllTransactions(userId, page, limit, filter)
  } catch (error) {
    throw error
  }
} 