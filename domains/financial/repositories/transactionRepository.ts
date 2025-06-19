import { Transaction, TransactionId } from '../entities/transaction'

export interface TransactionFilters {
  userId: string
  categoryId?: string
  startDate?: Date
  endDate?: Date
  type?: string
  description?: string
  limit?: number
  offset?: number
}

export interface TransactionRepository {
  // Basic CRUD operations
  save(transaction: Transaction): Promise<Transaction>
  findById(id: TransactionId): Promise<Transaction | null>
  findByUserId(userId: string): Promise<Transaction[]>
  update(transaction: Transaction): Promise<Transaction>
  delete(id: TransactionId): Promise<void>

  // Query operations
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>
  findRecent(userId: string, limit?: number): Promise<Transaction[]>
  findByCategory(userId: string, categoryId: string): Promise<Transaction[]>
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>
  
  // Aggregation operations
  countByFilters(filters: TransactionFilters): Promise<number>
  sumByCategory(userId: string, categoryId: string): Promise<number>
  sumByDateRange(userId: string, startDate: Date, endDate: Date): Promise<number>
  
  // Business queries
  findDuplicates(userId: string, description: string, amount: number, date: Date): Promise<Transaction[]>
  findRecurringTransactions(userId: string): Promise<Transaction[]>
  findLargestTransactions(userId: string, limit?: number): Promise<Transaction[]>
}

export default TransactionRepository 