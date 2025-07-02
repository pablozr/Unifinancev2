import { cache } from "react"
import { queryTransactions } from "@/app/dashboard/_data/utils/queryBuilder"
import { PeriodFilter } from "@/app/dashboard/_data/types"
import { analyzeRecurringPatterns } from "../_utils/patterns/analyzer"
import { generateProjection } from "../_utils/projection/calculator"
import { estimateInitialBalance } from "../_utils/balance/estimator"
import { subtractDays } from "../_utils/dates"
import { ProjectionResult, Transaction } from "../_types/projection"
import { ANALYSIS_PERIOD_DAYS } from "../_utils/constants"

/**
 * Gera projeção de fluxo de caixa completa
 */
export const getCashFlowProjection = cache(async (userId: string, filter: PeriodFilter): Promise<ProjectionResult> => {
  // 1. Buscar transações para análise
  const analysisTransactions = await fetchAnalysisTransactions(userId)
  
  // 2. Estimar saldo inicial
  const balanceEstimate = estimateInitialBalance(analysisTransactions)
  
  // 3. Analisar padrões recorrentes
  const recurringPatterns = analyzeRecurringPatterns(analysisTransactions)
  
  // 4. Gerar projeção
  const projection = generateProjection(balanceEstimate.initialBalance, recurringPatterns)
  
  return {
    projection,
    recurringPatterns,
    ...balanceEstimate,
    transactionCount: analysisTransactions.length,
    recentTransactionCount: analysisTransactions.filter((t: Transaction) => 
      new Date(t.date) >= subtractDays(new Date(), 30)
    ).length
  }
})

/**
 * Busca transações para análise de padrões
 */
const fetchAnalysisTransactions = async (userId: string) => {
  const endDate = new Date()
  const startDate = subtractDays(endDate, ANALYSIS_PERIOD_DAYS)
  
  return queryTransactions({
    userId,
    filter: {
      type: 'custom',
      startDate,
      endDate
    },
    offset: 0,
  })
} 