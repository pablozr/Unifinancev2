import { Transaction } from '../../_data/getCashFlowData'
import { normalizeDescription } from '../../_data/utils'
import { RecurringPattern, TransactionGroup } from '../../_types/projection'
import { calculateIntervals } from '../dates'
import { average, variationCoefficient } from '../math'
import { calculateConfidence } from './confidence'
import { calculateTrend } from './trend'
import { detectSeasonality } from './seasonality'
import { MIN_TRANSACTIONS_FOR_PATTERN, MIN_CONFIDENCE_THRESHOLD } from '../constants'

/**
 * Analisa transações e extrai padrões recorrentes
 */
export const analyzeRecurringPatterns = (transactions: Transaction[]): RecurringPattern[] => {
  if (transactions.length === 0) return []

  const groups = groupTransactionsByDescription(transactions)
  const validGroups = filterValidGroups(groups)
  const patterns = analyzeGroups(validGroups)
  
  return sortPatternsByRelevance(patterns)
}

/**
 * Agrupa transações por descrição normalizada
 */
const groupTransactionsByDescription = (transactions: Transaction[]): TransactionGroup[] => {
  const groups = new Map<string, Transaction[]>()
  
  transactions.forEach(transaction => {
    const key = normalizeDescription(transaction.description)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(transaction)
  })
  
  return Array.from(groups.entries()).map(([description, transactions]) => ({
    description,
    transactions: transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }))
}

/**
 * Filtra grupos com transações suficientes
 */
const filterValidGroups = (groups: TransactionGroup[]): TransactionGroup[] => {
  return groups.filter(group => group.transactions.length >= MIN_TRANSACTIONS_FOR_PATTERN)
}

/**
 * Analisa cada grupo e extrai padrões
 */
const analyzeGroups = (groups: TransactionGroup[]): RecurringPattern[] => {
  const patterns: RecurringPattern[] = []
  
  for (const group of groups) {
    const pattern = analyzeGroup(group)
    if (pattern && pattern.confidence > MIN_CONFIDENCE_THRESHOLD) {
      patterns.push(pattern)
    }
  }
  
  return patterns
}

/**
 * Analisa um grupo específico de transações
 */
const analyzeGroup = (group: TransactionGroup): RecurringPattern | null => {
  const { transactions, description } = group
  
  if (transactions.length < MIN_TRANSACTIONS_FOR_PATTERN) return null
  
  const amounts = transactions.map(t => t.amount)
  const dates = transactions.map(t => new Date(t.date))
  const intervals = calculateIntervals(dates)
  
  if (intervals.length === 0) return null
  
  const transactionType = transactions[0].type
  const avgAmount = average(amounts)
  const adjustedAvgAmount = transactionType === 'credit' ? avgAmount : -avgAmount
  
  return {
    description,
    avgAmount: adjustedAvgAmount,
    avgInterval: average(intervals),
    lastOccurrence: dates[dates.length - 1],
    type: transactionType === 'credit' ? 'income' : 'expense',
    confidence: calculateConfidence(intervals, amounts),
    trend: calculateTrend(amounts, dates),
    variability: variationCoefficient(amounts),
    seasonality: detectSeasonality(intervals),
    minAmount: Math.min(...amounts),
    maxAmount: Math.max(...amounts),
    transactionCount: transactions.length
  }
}

/**
 * Ordena padrões por relevância (confiança × impacto)
 */
const sortPatternsByRelevance = (patterns: RecurringPattern[]): RecurringPattern[] => {
  return patterns.sort((a, b) => {
    const scoreA = a.confidence * Math.abs(a.avgAmount)
    const scoreB = b.confidence * Math.abs(b.avgAmount)
    return scoreB - scoreA
  })
} 