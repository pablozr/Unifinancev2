export interface ProjectionPoint {
  date: string
  balance: number
  pessimistic: number
  optimistic: number
  confidence: number
}

export interface RecurringPattern {
  description: string
  avgAmount: number
  avgInterval: number
  lastOccurrence: Date
  type: 'income' | 'expense'
  confidence: number
  trend: number
  variability: number
  seasonality: 'weekly' | 'monthly' | 'quarterly' | 'none'
  minAmount: number
  maxAmount: number
  transactionCount: number
}

export interface TransactionGroup {
  transactions: any[] // Will be properly typed when importing
  description: string
}

export interface DailyImpact {
  base: number
  pessimistic: number
  optimistic: number
}

export interface BalanceEstimate {
  initialBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyFlow: number
}

export interface ProjectionResult {
  projection: ProjectionPoint[]
  recurringPatterns: RecurringPattern[]
  initialBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyFlow: number
  transactionCount: number
  recentTransactionCount: number
}

// Re-export Transaction type
export type { Transaction } from '../_data/getCashFlowData' 