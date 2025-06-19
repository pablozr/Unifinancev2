export interface DeleteFilters {
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  type?: 'credit' | 'debit'
  description?: string
  category?: string
}

export interface DeleteResult {
  deleted: number
  totalImpact: number
  breakdown: {
    credits: number
    debits: number
    creditAmount: number
    debitAmount: number
  }
}

export interface DeleteTransactionResult {
  success: boolean
  error?: string
  transactionId?: string
}

export interface PreviewDeletionResult {
  count: number
  totalAmount: number
} 