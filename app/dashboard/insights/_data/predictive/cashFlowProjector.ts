import type { RecurringTransaction } from './recurringDetector'

export interface CashFlowProjection {
  next30Days: number
  next60Days: number
  next90Days: number
  recurringIncome: number
  recurringExpenses: number
  alertDays: number[] // Dias que o saldo ficarÃ¡ negativo
}

export default function projectCashFlow(
  recurringTransactions: RecurringTransaction[], 
  currentBalance: number
): CashFlowProjection {
  const _now = new Date()
  const projectionPeriods = [30, 60, 90] // dias
  
  const monthlyRecurringIncome = recurringTransactions
    .filter(rt => rt.type === 'income')
    .reduce((sum, rt) => {
      const monthlyEquivalent = rt.frequency === 'weekly' ? rt.averageAmount * 4.33 :
                               rt.frequency === 'monthly' ? rt.averageAmount :
                               rt.frequency === 'quarterly' ? rt.averageAmount / 3 : 0
      return sum + monthlyEquivalent
    }, 0)
  
  const monthlyRecurringExpenses = recurringTransactions
    .filter(rt => rt.type === 'expense')
    .reduce((sum, rt) => {
      const monthlyEquivalent = rt.frequency === 'weekly' ? rt.averageAmount * 4.33 :
                               rt.frequency === 'monthly' ? rt.averageAmount :
                               rt.frequency === 'quarterly' ? rt.averageAmount / 3 : 0
      return sum + monthlyEquivalent
    }, 0)
  
  const projections = projectionPeriods.map(days => {
    const months = days / 30.44 // Meses mÃ©dios
    const projectedIncome = monthlyRecurringIncome * months
    const projectedExpenses = monthlyRecurringExpenses * months
    return currentBalance + projectedIncome - projectedExpenses
  })
  
  const alertDays: number[] = []
  let runningBalance = currentBalance
  const dailyIncome = monthlyRecurringIncome / 30.44
  const dailyExpenses = monthlyRecurringExpenses / 30.44
  
  for (let day = 1; day <= 90; day++) {
    runningBalance += dailyIncome - dailyExpenses
    
    const variation = runningBalance * 0.2 * (Math.random() - 0.5)
    const adjustedBalance = runningBalance + variation
    
    if (adjustedBalance < 0 && alertDays.length < 5) { // MÃ¡ximo 5 alertas
      alertDays.push(day)
    }
  }
  
  return {
    next30Days: Math.round(projections[0] * 100) / 100,
    next60Days: Math.round(projections[1] * 100) / 100,
    next90Days: Math.round(projections[2] * 100) / 100,
    recurringIncome: Math.round(monthlyRecurringIncome * 100) / 100,
    recurringExpenses: Math.round(monthlyRecurringExpenses * 100) / 100,
    alertDays: alertDays.sort((a, b) => a - b)
  }
} 
