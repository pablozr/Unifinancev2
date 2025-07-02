import { Transaction } from '../../_data/getCashFlowData'
import { BalanceEstimate } from '../../_types/projection'
import { subtractDays } from '../dates'
import { 
  RECENT_PERIOD_DAYS,
  SAVINGS_RATIO_HIGH,
  SAVINGS_RATIO_BALANCED,
  BALANCE_ESTIMATE_HIGH,
  BALANCE_ESTIMATE_BALANCED,
  BALANCE_ESTIMATE_SAFETY
} from '../constants'

/**
 * Estima saldo inicial baseado em transações recentes
 */
export const estimateInitialBalance = (transactions: Transaction[]): BalanceEstimate => {
  const recentTransactions = getRecentTransactions(transactions)
  const monthlyIncome = calculateMonthlyIncome(recentTransactions)
  const monthlyExpenses = calculateMonthlyExpenses(recentTransactions)
  const monthlyFlow = monthlyIncome - monthlyExpenses
  
  const initialBalance = calculateInitialBalance(
    recentTransactions.length,
    monthlyIncome,
    monthlyExpenses,
    monthlyFlow
  )
  
  return {
    initialBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlyFlow
  }
}

/**
 * Filtra transações dos últimos 30 dias
 */
const getRecentTransactions = (transactions: Transaction[]): Transaction[] => {
  const cutoffDate = subtractDays(new Date(), RECENT_PERIOD_DAYS)
  
  return transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate >= cutoffDate
  })
}

/**
 * Calcula receitas mensais
 */
const calculateMonthlyIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calcula despesas mensais
 */
const calculateMonthlyExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calcula saldo inicial estimado
 */
const calculateInitialBalance = (
  transactionCount: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlyFlow: number
): number => {
  // Sem dados recentes
  if (transactionCount === 0) return 0
  
  // Só despesas
  if (monthlyIncome === 0) {
    return Math.max(0, monthlyExpenses * BALANCE_ESTIMATE_SAFETY)
  }
  
  // Com receitas - estimar baseado no padrão
  const incomeExpenseRatio = monthlyIncome / (monthlyExpenses || 1)
  
  if (incomeExpenseRatio > SAVINGS_RATIO_HIGH) {
    // Economia positiva - provavelmente tem reserva
    return monthlyIncome * BALANCE_ESTIMATE_HIGH
  }
  
  if (incomeExpenseRatio > SAVINGS_RATIO_BALANCED) {
    // Equilibrado - saldo baixo mas positivo
    return monthlyIncome * BALANCE_ESTIMATE_BALANCED
  }
  
  // Gastando mais que ganha - saldo muito baixo
  return Math.max(0, monthlyFlow)
} 