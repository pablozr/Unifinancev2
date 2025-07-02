import type { Database } from '@/lib/types/database'

export type Transaction = Database['public']['Tables']['transactions']['Row']

export interface ClassifiedTransaction extends Transaction {
  isRecurring: boolean
} 