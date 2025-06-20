/**
 * @fileoverview Schemas de validaÃ§Ã£o Zod
 * @description ValidaÃ§Ã£o robusta de tipos para o sistema de dashboard
 */

import { z } from 'zod'


/**
 * @schema TransactionTypeSchema
 * @description Tipos vÃ¡lidos de transaÃ§Ã£o
 */
export const TransactionTypeSchema = z.enum(['credit', 'debit'])

/**
 * @schema PeriodTypeSchema  
 * @description Tipos vÃ¡lidos de perÃ­odo
 */
export const PeriodTypeSchema = z.enum(['monthly', 'yearly', 'custom'])

/**
 * @schema OrderBySchema
 * @description Campos vÃ¡lidos para ordenaÃ§Ã£o
 */
export const OrderBySchema = z.enum(['date', 'amount', 'description'])

/**
 * @schema OrderDirectionSchema
 * @description DireÃ§Ãµes vÃ¡lidas de ordenaÃ§Ã£o
 */
export const OrderDirectionSchema = z.enum(['asc', 'desc'])


/**
 * @schema PeriodFilterSchema
 * @description ValidaÃ§Ã£o para filtros de perÃ­odo
 */
export const PeriodFilterSchema = z.object({
  type: PeriodTypeSchema,
  year: z.number().int().min(1900).max(2100).optional(),
  month: z.number().int().min(0).max(11).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
}).refine((data) => {
  if (data.type === 'monthly') {
    return data.year !== undefined && data.month !== undefined
  }
  if (data.type === 'yearly') {
    return data.year !== undefined
  }
  return true // custom nÃ£o precisa de validaÃ§Ãµes adicionais
}, {
  message: "Filtro de perÃ­odo invÃ¡lido: campos obrigatÃ³rios ausentes"
})

/**
 * @schema DateRangeSchema
 * @description ValidaÃ§Ã£o para ranges de data
 */
export const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date()
}).refine((data) => data.start <= data.end, {
  message: "Data de inÃ­cio deve ser anterior ou igual Ã  data de fim"
})


/**
 * @schema TransactionQuerySchema
 * @description ValidaÃ§Ã£o para configuraÃ§Ã£o de queries de transaÃ§Ãµes
 */
export const TransactionQuerySchema = z.object({
  userId: z.string().uuid("ID do usuÃ¡rio deve ser UUID vÃ¡lido"),
  filter: PeriodFilterSchema.optional(),
  transactionType: TransactionTypeSchema.or(z.literal('all')).optional(),
  includeCategories: z.boolean().optional().default(false),
  orderBy: OrderBySchema.optional().default('date'),
  orderDirection: OrderDirectionSchema.optional().default('desc'),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().min(0).optional()
})


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
 * @description ValidaÃ§Ã£o para estatÃ­sticas do dashboard
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
 * @description ValidaÃ§Ã£o para dados mensais de cash flow
 */
export const CashFlowMonthSchema = z.object({
  month: z.string().min(1),
  income: z.number().min(0),
  expenses: z.number().min(0),
  balance: z.number()
})

/**
 * @schema MonthlyDataSchema
 * @description ValidaÃ§Ã£o para dados de comparaÃ§Ã£o mensal
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


/**
 * @schema MonthlyGroupSchema
 * @description ValidaÃ§Ã£o para grupos mensais
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


export const RecentTransactionsSchema = z.array(RecentTransactionSchema)
export const CategorySpendingArraySchema = z.array(CategorySpendingSchema)
export const CashFlowDataSchema = z.array(CashFlowMonthSchema)
export const MonthlyDataArraySchema = z.array(MonthlyDataSchema)
export const CategoryDataArraySchema = z.array(CategoryDataSchema)


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


/**
 * @function validatePeriodFilter
 * @description Valida filtro de período com mensagem de erro clara
 * @param {unknown} data - Dados para validar
 * @returns {PeriodFilter} Filtro validado
 * @throws {Error} Se validaÃ§Ã£o falhar
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
 * @description Valida configuraÃ§Ã£o de query de transaÃ§Ãµes
 * @param {unknown} data - Dados para validar
 * @returns {TransactionQuery} Query validada
 * @throws {Error} Se validaÃ§Ã£o falhar
 */
export const validateTransactionQuery = (data: unknown): TransactionQuery => {
  try {
    return TransactionQuerySchema.parse(data)
  } catch (error) {
    throw new Error(`Query de transaÃ§Ã£o invÃ¡lida: ${error}`)
  }
}

/**
 * @function validateUserId
 * @description Valida UUID de usuÃ¡rio
 * @param {unknown} userId - ID para validar
 * @returns {string} UUID validado
 * @throws {Error} Se nÃ£o for UUID vÃ¡lido
 */
export const validateUserId = (userId: unknown): string => {
  const uuidSchema = z.string().uuid("ID do usuÃ¡rio deve ser UUID vÃ¡lido")
  try {
    return uuidSchema.parse(userId)
  } catch (error) {
    throw new Error(`ID de usuÃ¡rio invÃ¡lido: ${error}`)
  }
} 
