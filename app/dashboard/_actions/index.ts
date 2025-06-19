/**
 * @fileoverview Dashboard Actions Module  
 * @description Exporta todas as actions do dashboard
 */

export { default as addSingleTransaction } from './addSingleTransaction'
export { getTransactionsClient } from './getTransactionsClient'

export {
  deleteTransactions,
  deleteAllTransactionsByPeriod,
  deleteAllUserTransactions,
  deleteAllImportedTransactions,
  deleteSingleTransaction,
  deleteSingleTransactionById,
  previewDeletion,
  previewDeletionByPeriod,
  clearAllImportRecords,
  forceDeleteImportByHash,
  type DeleteFilters,
  type DeleteResult,
  type DeleteTransactionResult,
  type PreviewDeletionResult
} from './deleteTransactions'

export type { CreateTransactionData, CreateTransactionResult } from './addSingleTransaction' 
