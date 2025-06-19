'use server'

// Importações dos tipos
import type { DeleteFilters, DeleteResult, DeleteTransactionResult, PreviewDeletionResult } from './delete/types'

// Re-exportar tipos (permitido em arquivos use server)
export type {
  DeleteFilters,
  DeleteResult,
  DeleteTransactionResult,
  PreviewDeletionResult
}

/**
 * Deleta transações baseado nos filtros fornecidos
 */
export async function deleteTransactions(userId: string, filters: DeleteFilters): Promise<DeleteResult> {
  const { deleteByFilters } = await import('./delete')
  return deleteByFilters(userId, filters)
}

/**
 * Deleta todas as transações em um período específico
 */
export async function deleteAllTransactionsByPeriod(userId: string, startDate: Date, endDate: Date): Promise<DeleteResult> {
  const { deleteByPeriod } = await import('./delete')
  return deleteByPeriod(userId, startDate, endDate)
}

/**
 * Deleta TODAS as transações do usuário
 */
export async function deleteAllUserTransactions(userId: string): Promise<DeleteResult> {
  const { deleteAllTransactions } = await import('./delete')
  return deleteAllTransactions(userId)
}

/**
 * Deleta transações importadas e limpa registros de import
 */
export async function deleteAllImportedTransactions(userId: string, startDate: Date, endDate: Date): Promise<DeleteResult> {
  const { deleteImportedTransactions } = await import('./delete')
  return deleteImportedTransactions(userId, startDate, endDate)
}

/**
 * Preview de exclusão por filtros
 */
export async function previewDeletion(userId: string, filters: DeleteFilters): Promise<{ count: number; totalAmount: number }> {
  const { previewDeletionByFilters } = await import('./delete')
  return previewDeletionByFilters(userId, filters)
}

/**
 * Preview de exclusão por período
 */
export async function previewDeletionByPeriod(userId: string, startDate: Date, endDate: Date): Promise<{ count: number; totalAmount: number }> {
  const { previewDeletionByPeriod } = await import('./delete')
  return previewDeletionByPeriod(userId, startDate, endDate)
}

/**
 * Deleta uma única transação por ID
 */
export async function deleteSingleTransactionById(transactionId: string): Promise<DeleteTransactionResult> {
  const { deleteSingleTransactionById } = await import('./delete')
  return deleteSingleTransactionById(transactionId)
}

/**
 * Remove todos os registros de importação do usuário
 */
export async function clearAllImportRecords(userId: string): Promise<{ success: boolean; message: string }> {
  const { clearAllImportRecords } = await import('./delete')
  return clearAllImportRecords(userId)
}

/**
 * Remove importação específica por hash do arquivo
 */
export async function forceDeleteImportByHash(userId: string, fileHash: string): Promise<{ success: boolean; message: string }> {
  const { forceDeleteImportByHash } = await import('./delete')
  return forceDeleteImportByHash(userId, fileHash)
}

/**
 * Função legacy para compatibilidade - deleta uma única transação
 */
export async function deleteSingleTransaction(transactionId: string): Promise<DeleteTransactionResult> {
  const { deleteSingleTransactionById } = await import('./delete')
  return deleteSingleTransactionById(transactionId)
} 