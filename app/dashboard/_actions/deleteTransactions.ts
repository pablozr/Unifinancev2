'use server'

import type { DeleteFilters, DeleteResult, DeleteTransactionResult, PreviewDeletionResult } from './delete/types'

export type {
  DeleteFilters,
  DeleteResult,
  DeleteTransactionResult,
  PreviewDeletionResult
}

/**
 * Deleta transaÃ§Ãµes baseado nos filtros fornecidos
 */
export async function deleteTransactions(userId: string, filters: DeleteFilters): Promise<DeleteResult> {
  const { deleteByFilters } = await import('./delete')
  return deleteByFilters(userId, filters)
}

/**
 * Deleta todas as transaÃ§Ãµes em um perÃ­odo especÃ­fico
 */
export async function deleteAllTransactionsByPeriod(userId: string, startDate: Date, endDate: Date): Promise<DeleteResult> {
  const { deleteByPeriod } = await import('./delete')
  return deleteByPeriod(userId, startDate, endDate)
}

/**
 * Deleta TODAS as transaÃ§Ãµes do usuÃ¡rio
 */
export async function deleteAllUserTransactions(userId: string): Promise<DeleteResult> {
  const { deleteAllTransactions } = await import('./delete')
  return deleteAllTransactions(userId)
}

/**
 * Deleta transaÃ§Ãµes importadas e limpa registros de import
 */
export async function deleteAllImportedTransactions(userId: string, startDate: Date, endDate: Date): Promise<DeleteResult> {
  const { deleteImportedTransactions } = await import('./delete')
  return deleteImportedTransactions(userId, startDate, endDate)
}

/**
 * Preview de exclusÃ£o por filtros
 */
export async function previewDeletion(userId: string, filters: DeleteFilters): Promise<{ count: number; totalAmount: number }> {
  const { previewDeletionByFilters } = await import('./delete')
  return previewDeletionByFilters(userId, filters)
}

/**
 * Preview de exclusÃ£o por perÃ­odo
 */
export async function previewDeletionByPeriod(userId: string, startDate: Date, endDate: Date): Promise<{ count: number; totalAmount: number }> {
  const { previewDeletionByPeriod } = await import('./delete')
  return previewDeletionByPeriod(userId, startDate, endDate)
}

/**
 * Deleta uma Ãºnica transaÃ§Ã£o por ID
 */
export async function deleteSingleTransactionById(transactionId: string): Promise<DeleteTransactionResult> {
  const { deleteSingleTransactionById } = await import('./delete')
  return deleteSingleTransactionById(transactionId)
}

/**
 * Remove todos os registros de importaÃ§Ã£o do usuÃ¡rio
 */
export async function clearAllImportRecords(userId: string): Promise<{ success: boolean; message: string }> {
  const { clearAllImportRecords } = await import('./delete')
  return clearAllImportRecords(userId)
}

/**
 * Remove importaÃ§Ã£o especÃ­fica por hash do arquivo
 */
export async function forceDeleteImportByHash(userId: string, fileHash: string): Promise<{ success: boolean; message: string }> {
  const { forceDeleteImportByHash } = await import('./delete')
  return forceDeleteImportByHash(userId, fileHash)
}

/**
 * FunÃ§Ã£o legacy para compatibilidade - deleta uma Ãºnica transaÃ§Ã£o
 */
export async function deleteSingleTransaction(transactionId: string): Promise<DeleteTransactionResult> {
  const { deleteSingleTransactionById } = await import('./delete')
  return deleteSingleTransactionById(transactionId)
} 
