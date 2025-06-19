export interface RawBankStatement {
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
}

export interface ProcessedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  detectedCategory?: string;
  categoryConfidence?: number;
  categoryId?: string;
  month: number;
  year: number;
}

export interface MonthlyData {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactions: ProcessedTransaction[];
}
