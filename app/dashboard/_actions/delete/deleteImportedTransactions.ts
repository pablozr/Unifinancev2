'use server'

import deleteByPeriod from './deleteByPeriod'
import { clearAllImportRecords } from './clearImportRecords'
import type { DeleteResult } from './types'

/**
 * Deleta TODAS as transações em um período E os registros de import
 */
export default async function deleteImportedTransactions(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<DeleteResult> {
  const result = await deleteByPeriod(userId, startDate, endDate)
  
  try {
    await clearAllImportRecords(userId)
  } catch (error) {
    // ... existing code ...
  }
  
  return result
} 