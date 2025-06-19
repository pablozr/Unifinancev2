'use server'
import { createClient } from '@/lib/supabase/server'
import { getDateRangeFromFilter } from '../../_data/utils/dateUtils'
import type { PeriodFilter } from '../../_data/types'

import {
  detectRecurringTransactions,
  projectCashFlow,
  generateAutomaticInsights,
  linearRegression,
  detectSeasonality,
  calculateVolatility,
  detectCyclicalPatterns,
  analyzeTrendsWithMovingAverage,
  type RecurringTransaction,
  type CashFlowProjection,
  type MonthlyDataPoint
} from './predictive'

export interface PredictiveAnalysis {
  nextMonthExpenses: number
  nextMonthIncome: number
  nextMonthBalance: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendation: string
  seasonalityFactor?: number
  volatilityScore?: number
  trendStrength?: number
  historicalAccuracy?: number
  recurringTransactions?: RecurringTransaction[]
  automaticInsights?: string[]
  cashFlowProjection?: CashFlowProjection
}

export async function getPredictiveAnalysisRefactored(
  userId: string, 
  filter: PeriodFilter = { type: 'custom' }
): Promise<PredictiveAnalysis> {
  const supabase = await createClient()
  
  let dateRange = getDateRangeFromFilter(filter)
  
  if (!dateRange || filter.type === 'custom') {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    dateRange = {
      start: twelveMonthsAgo,
      end: new Date()
    }
  } else {
    const expandedStart = new Date(dateRange.start)
    expandedStart.setMonth(expandedStart.getMonth() - 6)
    dateRange = {
      start: expandedStart,
      end: dateRange.end
    }
  }
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .eq('user_id', userId)
    .gte('date', dateRange.start.toISOString())
    .lte('date', dateRange.end.toISOString())
    .order('date', { ascending: true })
    
  if (error) {
    return {
      nextMonthExpenses: 0,
      nextMonthIncome: 0,
      nextMonthBalance: 0,
      confidence: 0,
      trend: 'stable',
      recommendation: 'Dados insuficientes para anÃ¡lise preditiva avanÃ§ada'
    }
  }

  const monthlyData = groupTransactionsByMonth(transactions)
  
  if (monthlyData.length < 3) {
    return {
      nextMonthExpenses: monthlyData[0]?.expenses || 0,
      nextMonthIncome: monthlyData[0]?.income || 0,
      nextMonthBalance: monthlyData[0]?.balance || 0,
      confidence: 25,
      trend: 'stable',
      recommendation: 'Precisa de pelo menos 3 meses de dados para anÃ¡lise preditiva robusta'
    }
  }

  const recurringTransactions = detectRecurringTransactions(transactions)
  const seasonality = detectSeasonality(monthlyData)
  const volatilityScore = calculateVolatility(monthlyData)
  const cyclicalPattern = detectCyclicalPatterns(monthlyData)
  const trendAnalysis = analyzeTrendsWithMovingAverage(monthlyData)

  const nextMonthIndex = monthlyData.length
  const incomePoints = monthlyData.map((data, index) => ({ x: index, y: data.income }))
  const expensePoints = monthlyData.map((data, index) => ({ x: index, y: data.expenses }))
  const balancePoints = monthlyData.map((data, index) => ({ x: index, y: data.balance }))

  const incomeRegression = linearRegression(incomePoints)
  const expenseRegression = linearRegression(expensePoints)
  const balanceRegression = linearRegression(balancePoints)

  const predictions = calculateSmartPredictions({
    monthlyData,
    recurringTransactions,
    seasonality,
    volatilityScore,
    cyclicalPattern,
    regressions: {
      income: incomeRegression,
      expense: expenseRegression,
      balance: balanceRegression
    },
    nextMonthIndex
  })

  const confidence = calculateModelConfidence({
    monthlyData,
    recurringTransactions,
    seasonality,
    volatilityScore,
    regressions: { income: incomeRegression, expense: expenseRegression }
  })

  const trend = determineTrend(balanceRegression, trendAnalysis)

  const automaticInsights = generateAutomaticInsights(transactions, recurringTransactions, monthlyData)

  const currentBalance = monthlyData[monthlyData.length - 1]?.balance || 0
  const cashFlowProjection = projectCashFlow(recurringTransactions, currentBalance)

  const recommendation = generateSmartRecommendation({
    trend,
    confidence,
    volatilityScore,
    recurringTransactions,
    cashFlowProjection
  })

  return {
    nextMonthExpenses: Math.round(predictions.expenses * 100) / 100,
    nextMonthIncome: Math.round(predictions.income * 100) / 100,
    nextMonthBalance: Math.round(predictions.balance * 100) / 100,
    confidence: Math.round(confidence),
    trend,
    recommendation,
    seasonalityFactor: seasonality.factor,
    volatilityScore: volatilityScore,
    trendStrength: trendAnalysis.trendStrength,
    historicalAccuracy: (incomeRegression.r2 + expenseRegression.r2) / 2,
    recurringTransactions: recurringTransactions.slice(0, 10), // Top 10 mais relevantes
    automaticInsights: automaticInsights,
    cashFlowProjection: cashFlowProjection
  }
}


function groupTransactionsByMonth(transactions: any[]): MonthlyDataPoint[] {
  const monthlyData = new Map<string, MonthlyDataPoint>()
  
  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        month: monthKey,
        income: 0,
        expenses: 0,
        balance: 0,
        transactionCount: 0,
        date: new Date(date.getFullYear(), date.getMonth(), 1)
      })
    }
    
    const monthData = monthlyData.get(monthKey)!
    monthData.transactionCount++
    
    if (transaction.type === 'credit') {
      monthData.income += transaction.amount
    } else {
      monthData.expenses += Math.abs(transaction.amount)
    }
    
    monthData.balance = monthData.income - monthData.expenses
  })
  
  return Array.from(monthlyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
}

function calculateSmartPredictions(params: {
  monthlyData: MonthlyDataPoint[]
  recurringTransactions: RecurringTransaction[]
  seasonality: any
  volatilityScore: number
  cyclicalPattern: any
  regressions: any
  nextMonthIndex: number
}) {
  const { monthlyData, recurringTransactions, seasonality, regressions, nextMonthIndex } = params
  
  const allRecurringIncome = recurringTransactions
    .filter(rt => rt.type === 'income')
    .reduce((sum, rt) => {
      const monthlyEquivalent = rt.frequency === 'weekly' ? rt.averageAmount * 4.33 :
                               rt.frequency === 'monthly' ? rt.averageAmount :
                               rt.frequency === 'quarterly' ? rt.averageAmount / 3 : 0
      return sum + monthlyEquivalent
    }, 0)
  
  const allRecurringExpenses = recurringTransactions
    .filter(rt => rt.type === 'expense')
    .reduce((sum, rt) => {
      const monthlyEquivalent = rt.frequency === 'weekly' ? rt.averageAmount * 4.33 :
                               rt.frequency === 'monthly' ? rt.averageAmount :
                               rt.frequency === 'quarterly' ? rt.averageAmount / 3 : 0
      return sum + monthlyEquivalent
    }, 0)
  
  const recentMonths = monthlyData.slice(-3)
  const recentAvgIncome = recentMonths.reduce((sum, m) => sum + m.income, 0) / recentMonths.length
  const recentAvgExpenses = recentMonths.reduce((sum, m) => sum + m.expenses, 0) / recentMonths.length
  
  const regressionIncome = regressions.income.slope * nextMonthIndex + regressions.income.intercept
  const regressionExpenses = regressions.expense.slope * nextMonthIndex + regressions.expense.intercept
  
  const regressionQuality = (regressions.income.r2 + regressions.expense.r2) / 2
  const recurringQuality = recurringTransactions.length > 0 ? 
    recurringTransactions.reduce((sum, rt) => sum + rt.confidence, 0) / recurringTransactions.length / 100 : 0
  
  const weightRecurring = Math.min(0.5, recurringQuality * 0.7)
  const weightRegression = Math.min(0.35, regressionQuality * 0.5)
  const weightRecent = 1 - weightRecurring - weightRegression
  
  let predictedIncome = 
    (allRecurringIncome * weightRecurring) +
    (regressionIncome * weightRegression) +
    (recentAvgIncome * weightRecent)
  
  let predictedExpenses = 
    (allRecurringExpenses * weightRecurring) +
    (regressionExpenses * weightRegression) +
    (recentAvgExpenses * weightRecent)
  
  if (seasonality.confidence > 20) {
    const seasonalFactor = 1 + (seasonality.factor - 1) * (seasonality.confidence / 100)
    predictedIncome *= seasonalFactor
    predictedExpenses *= seasonalFactor
  }
  
  const lastMonth = monthlyData[monthlyData.length - 1]
  const maxChange = 0.25 // MÃ¡ximo 25% de variaÃ§Ã£o
  
  predictedIncome = Math.max(0, Math.min(
    lastMonth.income * (1 + maxChange),
    Math.max(lastMonth.income * (1 - maxChange), predictedIncome)
  ))
  
  predictedExpenses = Math.max(0, Math.min(
    lastMonth.expenses * (1 + maxChange),
    Math.max(lastMonth.expenses * (1 - maxChange), predictedExpenses)
  ))
  
  return {
    income: predictedIncome,
    expenses: predictedExpenses,
    balance: predictedIncome - predictedExpenses
  }
}

function calculateModelConfidence(params: {
  monthlyData: MonthlyDataPoint[]
  recurringTransactions: RecurringTransaction[]
  seasonality: any
  volatilityScore: number
  regressions: any
}) {
  const { monthlyData, recurringTransactions, seasonality, volatilityScore, regressions } = params
  
  let confidence = 40 // Base conservadora
  
  confidence += Math.min(25, monthlyData.length * 2.5)
  
  const regressionBoost = (regressions.income.r2 + regressions.expense.r2) * 20
  confidence += regressionBoost
  
  const recurringBoost = Math.min(25, recurringTransactions.length * 2.5)
  confidence += recurringBoost
  
  const volatilityPenalty = volatilityScore * 30
  confidence -= volatilityPenalty
  
  if (seasonality.confidence > 20) {
    const seasonalBoost = Math.min(15, seasonality.confidence / 4)
    confidence += seasonalBoost
  }
  
  return Math.max(15, Math.min(95, confidence))
}

function determineTrend(balanceRegression: any, trendAnalysis: any): 'up' | 'down' | 'stable' {
  if (balanceRegression.slope > 100 && balanceRegression.r2 > 0.3) {
    return 'up'
  } else if (balanceRegression.slope < -100 && balanceRegression.r2 > 0.3) {
    return 'down'
  }
  
  return trendAnalysis.trendDirection || 'stable'
}

function generateSmartRecommendation(params: {
  trend: 'up' | 'down' | 'stable'
  confidence: number
  volatilityScore: number
  recurringTransactions: RecurringTransaction[]
  cashFlowProjection: CashFlowProjection
}): string {
  const { trend, confidence, volatilityScore, recurringTransactions, cashFlowProjection } = params
  
  if (cashFlowProjection.alertDays.length > 0) {
    return `âš ï¸ Alerta: Saldo pode ficar negativo em ${cashFlowProjection.alertDays[0]} dias. Revise gastos recorrentes de R$ ${cashFlowProjection.recurringExpenses.toFixed(2)}.`
  }
  
  if (trend === 'up' && confidence > 70) {
    return `ðŸ“ˆ TendÃªncia positiva detectada com ${recurringTransactions.length} padrÃµes recorrentes identificados. Continue otimizando gastos fixos.`
  }
  
  if (trend === 'down' && confidence > 60) {
    return `ðŸ“‰ TendÃªncia de queda com alta confianÃ§a. Foque em reduzir as ${recurringTransactions.filter(rt => rt.type === 'expense').length} despesas recorrentes detectadas.`
  }
  
  if (volatilityScore > 0.5) {
    return `ðŸŽ¢ Alta volatilidade (${(volatilityScore * 100).toFixed(1)}%). Considere automatizar mais receitas e despesas para maior previsibilidade.`
  }
  
  if (recurringTransactions.length > 5) {
    return `ðŸ”„ PadrÃ£o financeiro bem estruturado com ${recurringTransactions.length} transaÃ§Ãµes recorrentes. Foque em otimizar os valores.`
  }
  
  return `ðŸ’¡ FinanÃ§as estÃ¡veis. Considere criar mais receitas recorrentes e controlar melhor gastos variÃ¡veis.`
} 
