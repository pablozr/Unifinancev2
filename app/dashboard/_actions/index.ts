/**
 * @fileoverview Dashboard Actions Module  
 * @description Exporta todas as actions do dashboard
 */

// === TRANSAÇÕES - CRUD ===
export { default as addSingleTransaction } from './addSingleTransaction'
export { getTransactionsClient } from './getTransactionsClient'

// === EXCLUSÃO - ESTRUTURA MODULAR ===
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

// === TIPOS ===
export type { CreateTransactionData, CreateTransactionResult } from './addSingleTransaction' 