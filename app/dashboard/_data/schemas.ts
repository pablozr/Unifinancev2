/**
 * @fileoverview Schemas de validação Zod
 * @description Validação robusta de tipos para o sistema de dashboard
 */

import { z } from 'zod'

// === SCHEMAS BÁSICOS ===

/**
 * @schema TransactionTypeSchema
 * @description Tipos válidos de transação
 */
export const TransactionTypeSchema = z.enum(['credit', 'debit'])

/**
 * @schema PeriodTypeSchema  
 * @description Tipos válidos de período
 */
export const PeriodTypeSchema = z.enum(['monthly', 'yearly', 'custom'])

/**
 * @schema OrderBySchema
 * @description Campos válidos para ordenação
 */
export const OrderBySchema = z.enum(['date', 'amount', 'description'])

/**
 * @schema OrderDirectionSchema
 * @description Direções válidas de ordenação
 */
export const OrderDirectionSchema = z.enum(['asc', 'desc'])

// === SCHEMAS DE FILTROS ===

/**
 * @schema PeriodFilterSchema
 * @description Validação para filtros de período
 */
export const PeriodFilterSchema = z.object({
  type: PeriodTypeSchema,
  year: z.number().int().min(1900).max(2100).optional(),
  month: z.number().int().min(0).max(11).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
}).refine((data) => {
  // Validação condicional baseada no tipo
  if (data.type === 'monthly') {
    return data.year !== undefined && data.month !== undefined
  }
  if (data.type === 'yearly') {
    return data.year !== undefined
  }
  return true // custom não precisa de validações adicionais
}, {
  message: "Filtro de período inválido: campos obrigatórios ausentes"
})

/**
 * @schema DateRangeSchema
 * @description Validação para ranges de data
 */
export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date()
}).refine((data) => data.start <= data.end, {
  message: "Data de início deve ser anterior ou igual à data de fim"
})

// === SCHEMAS DE QUERY ===

/**
 * @schema TransactionQuerySchema
 * @description Validação para configuração de queries de transações
 */
export const TransactionQuerySchema = z.object({
  userId: z.string().uuid("ID do usuário deve ser UUID válido"),
  filter: PeriodFilterSchema.optional(),
  transactionType: TransactionTypeSchema.or(z.literal('all')).optional(),
  includeCategories: z.boolean().optional().default(false),
  orderBy: OrderBySchema.optional().default('date'),
  orderDirection: OrderDirectionSchema.optional().default('desc'),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().min(0).optional()
})

// === SCHEMAS DE RESPOSTA ===

/**
 * @schema RecentTransactionSchema
 * @description Validação para transações recentes
 */
export const RecentTransactionSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']), // Frontend usa income/expense
  date: z.date(),
  categoryName: z.string().optional(),
  categoryColor: z.string().optional()
})

/**
 * @schema DashboardStatsSchema
 * @description Validação para estatísticas do dashboard
 */
export const DashboardStatsSchema = z.object({
  totalBalance: z.number(),
  monthlyIncome: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  transactionCount: z.number().int().min(0),
  incomeChange: z.number(),
  expenseChange: z.number(),
  balanceChange: z.number(),
  transactionChange: z.number()
})

/**
 * @schema CategorySpendingSchema
 * @description Validação para gastos por categoria
 */
export const CategorySpendingSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
  count: z.number().int().min(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser hex válida"),
  avgAmount: z.number().min(0)
})

/**
 * @schema CashFlowMonthSchema
 * @description Validação para dados mensais de cash flow
 */
export const CashFlowMonthSchema = z.object({
  month: z.string().min(1),
  income: z.number().min(0),
  expenses: z.number().min(0),
  balance: z.number()
})

/**
 * @schema MonthlyDataSchema
 * @description Validação para dados de comparação mensal
 */
export const MonthlyDataSchema = z.object({
  month: z.string().min(1),
  income: z.number().min(0),
  expenses: z.number().min(0),
  balance: z.number(),
  transactionCount: z.number().int().min(0),
  avgTicket: z.number().min(0)
})

/**
 * @schema CategoryDataSchema
 * @description Validação para dados de categoria em insights
 */
export const CategoryDataSchema = z.object({
  name: z.string().min(1),
  total: z.number().min(0),
  percentage: z.number().min(0).max(100),
  transactions: z.number().int().min(0),
  avgAmount: z.number().min(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i)
})

/**
 * @schema InsightMetricsSchema
 * @description Validação para métricas de insights
 */
export const InsightMetricsSchema = z.object({
  totalTransactions: z.number().int().min(0),
  avgMonthlyIncome: z.number().min(0),
  avgMonthlyExpenses: z.number().min(0),
  avgTicketSize: z.number().min(0),
  mostExpensiveCategory: z.string().optional(),
  mostFrequentCategory: z.string().optional(),
  savingsRate: z.number().min(-100).max(100) // Pode ser negativo
})

// === SCHEMAS DE AGREGAÇÃO ===

/**
 * @schema MonthlyGroupSchema
 * @description Validação para grupos mensais
 */
export const MonthlyGroupSchema = z.object({
  income: z.number().min(0),
  expenses: z.number().min(0),
  month: z.string().min(1),
  transactionCount: z.number().int().min(0)
})

/**
 * @schema CategoryGroupSchema
 * @description Validação para grupos por categoria
 */
export const CategoryGroupSchema = z.object({
  name: z.string().min(1),
  total: z.number().min(0),
  count: z.number().int().min(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i)
})

// === ARRAYS ===

export const RecentTransactionsSchema = z.array(RecentTransactionSchema)
export const CategorySpendingArraySchema = z.array(CategorySpendingSchema)
export const CashFlowDataSchema = z.array(CashFlowMonthSchema)
export const MonthlyDataArraySchema = z.array(MonthlyDataSchema)
export const CategoryDataArraySchema = z.array(CategoryDataSchema)

// === TIPOS INFERIDOS ===

export type TransactionType = z.infer<typeof TransactionTypeSchema>
export type PeriodType = z.infer<typeof PeriodTypeSchema>
export type OrderBy = z.infer<typeof OrderBySchema>
export type OrderDirection = z.infer<typeof OrderDirectionSchema>
export type PeriodFilter = z.infer<typeof PeriodFilterSchema>
export type DateRange = z.infer<typeof DateRangeSchema>
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>
export type RecentTransaction = z.infer<typeof RecentTransactionSchema>
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type CategorySpending = z.infer<typeof CategorySpendingSchema>
export type CashFlowMonth = z.infer<typeof CashFlowMonthSchema>
export type MonthlyData = z.infer<typeof MonthlyDataSchema>
export type CategoryData = z.infer<typeof CategoryDataSchema>
export type InsightMetrics = z.infer<typeof InsightMetricsSchema>
export type MonthlyGroup = z.infer<typeof MonthlyGroupSchema>
export type CategoryGroup = z.infer<typeof CategoryGroupSchema>

// === UTILITÁRIOS DE VALIDAÇÃO ===

/**
 * @function validatePeriodFilter
 * @description Valida filtro de período com mensagem de erro clara
 * @param {unknown} data - Dados para validar
 * @returns {PeriodFilter} Filtro validado
 * @throws {Error} Se validação falhar
 */
export const validatePeriodFilter = (data: unknown): PeriodFilter => {
  try {
    return PeriodFilterSchema.parse(data)
  } catch (error) {
    throw new Error(`Filtro de período inválido: ${error}`)
  }
}

/**
 * @function validateTransactionQuery
 * @description Valida configuração de query de transações
 * @param {unknown} data - Dados para validar
 * @returns {TransactionQuery} Query validada
 * @throws {Error} Se validação falhar
 */
export const validateTransactionQuery = (data: unknown): TransactionQuery => {
  try {
    return TransactionQuerySchema.parse(data)
  } catch (error) {
    throw new Error(`Query de transação inválida: ${error}`)
  }
}

/**
 * @function validateUserId
 * @description Valida UUID de usuário
 * @param {unknown} userId - ID para validar
 * @returns {string} UUID validado
 * @throws {Error} Se não for UUID válido
 */
export const validateUserId = (userId: unknown): string => {
  const uuidSchema = z.string().uuid("ID do usuário deve ser UUID válido")
  try {
    return uuidSchema.parse(userId)
  } catch (error) {
    throw new Error(`ID de usuário inválido: ${error}`)
  }
} 