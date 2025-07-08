'use server'

import { cache } from 'react'
import type { PeriodFilter } from './types'
import { getDateRangeFromFilter } from './utils/dateUtils'
import { queryTransactionsByDateRange } from './utils/queryBuilder'

export interface RecurringVsVariableData {
  recurring: number
  variable: number
}

const getRecurringVsVariableData = cache(
  async (
    userId: string,
    filter?: PeriodFilter
  ): Promise<RecurringVsVariableData> => {
    const range = filter ? getDateRangeFromFilter(filter) : undefined

    if (!range) {
      return { recurring: 0, variable: 0 }
    }

    const transactions = await queryTransactionsByDateRange(userId, range, {
      transactionType: 'debit',
    })

    let recurring = 0
    let variable = 0

    for (const t of transactions) {
      if (t.is_recurring) {
        recurring += t.amount
      } else {
        variable += t.amount
      }
    }

    return { recurring, variable }
  }
)

export default getRecurringVsVariableData 