﻿/**
 * @fileoverview Tipos e interfaces para dados do dashboard
 * @description Define todas as estruturas de dados utilizadas no dashboard financeiro
 */

/** 
 * @interface DashboardStats
 * @description EstatÃ­sticas principais do dashboard
 */
export interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  transactionCount: number
  incomeChange: number
  expenseChange: number
  balanceChange: number
  transactionChange: number
}

/** 
 * @interface RecentTransaction
 * @description Estrutura de uma transaÃ§Ã£o recente
 */
export interface RecentTransaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  date: Date
  categoryName?: string
  categoryColor?: string
  is_recurring?: boolean | null
}

/** 
 * @interface CategorySpending
 * @description Dados de gastos por categoria
 */
export interface CategorySpending {
  categoryName: string
  totalAmount: number
  transactionCount: number
  color: string
  percentage: number
}

/** 
 * @interface CashFlowMonth
 * @description Fluxo de caixa mensal
 */
export interface CashFlowMonth {
  month: string
  income: number
  expenses: number
  balance: number
}

/** 
 * @interface PeriodFilter
 * @description Filtro de perÃ­odo para queries
 */
export interface PeriodFilter {
  type: 'monthly' | 'yearly' | 'custom'
  year?: number
  month?: number
  startDate?: Date
  endDate?: Date
}

/** 
 * @interface PaginatedTransactions
 * @description TransaÃ§Ãµes paginadas
 */
export interface PaginatedTransactions {
  transactions: RecentTransaction[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/** 
 * @type TransactionType
 * @description Tipos de transaÃ§Ã£o do Prisma
 */
export type TransactionType = 'credit' | 'debit'

/** 
 * @interface DateRange
 * @description Range de datas para queries
 */
export interface DateRange {
  start: Date
  end: Date
}


/**
 * @interface MonthlyData
 * @description Dados mensais detalhados para insights
 */
export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
  transactionCount: number
  avgTicket: number
}

/**
 * @interface CategoryData
 * @description Dados de categoria para insights (diferente de CategorySpending)
 */
export interface CategoryData {
  label: string
  value: number
  color: string
  percentage: number
  transactionCount: number
}

/**
 * @interface InsightMetrics
 * @description MÃ©tricas avanÃ§adas para insights
 */
export interface InsightMetrics {
  monthlySavings: number
  averageTicket: number
  growthRate: number
  savingsChange: number
  ticketChange: number
  growthChange: number
  totalTransactions: number
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
} 
