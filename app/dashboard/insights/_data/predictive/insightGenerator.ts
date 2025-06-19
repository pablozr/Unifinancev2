import type { RecurringTransaction } from './recurringDetector'
import type { MonthlyDataPoint } from './mathematicalAnalysis'

export default function generateAutomaticInsights(
  transactions: any[], 
  recurringTransactions: RecurringTransaction[],
  monthlyData: MonthlyDataPoint[]
): string[] {
  const insights: string[] = []
  
  if (monthlyData.length < 2) {
    return ['Dados insuficientes para gerar insights automáticos.']
  }
  
  const lastMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  
  // 1. Análise de gastos por categoria
  const categoryTotals = new Map<string, number>()
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      const category = t.categories?.name || 'Outros'
      categoryTotals.set(category, (categoryTotals.get(category) || 0) + Math.abs(t.amount))
    })
  
  const sortedCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0]
    const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0)
    const percentage = totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0
    
    if (percentage > 30) {
      insights.push(`💰 ${topCategory} representa ${percentage.toFixed(1)}% dos seus gastos totais (R$ ${topAmount.toFixed(2)})`)
    }
  }
  
  // 2. Análise de transações recorrentes
  const highConfidenceRecurring = recurringTransactions.filter(rt => rt.confidence > 70)
  if (highConfidenceRecurring.length > 0) {
    const totalRecurringExpenses = highConfidenceRecurring
      .filter(rt => rt.type === 'expense')
      .reduce((sum, rt) => sum + rt.averageAmount, 0)
    
    if (totalRecurringExpenses > 0) {
      insights.push(`🔄 Você tem ${highConfidenceRecurring.length} padrões recorrentes detectados, totalizando R$ ${totalRecurringExpenses.toFixed(2)}/mês`)
    }
  }
  
  // 3. Comparação mês anterior
  if (lastMonth && previousMonth) {
    const expenseChange = ((lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
    const incomeChange = ((lastMonth.income - previousMonth.income) / previousMonth.income) * 100
    
    if (Math.abs(expenseChange) > 15) {
      const direction = expenseChange > 0 ? 'aumentaram' : 'diminuíram'
      insights.push(`📊 Suas despesas ${direction} ${Math.abs(expenseChange).toFixed(1)}% comparado ao mês anterior`)
    }
    
    if (Math.abs(incomeChange) > 15) {
      const direction = incomeChange > 0 ? 'aumentou' : 'diminuiu'
      insights.push(`💹 Sua receita ${direction} ${Math.abs(incomeChange).toFixed(1)}% comparado ao mês anterior`)
    }
  }
  
  // 4. Análise de anomalias de gastos
  const spendingAnomalies = detectSpendingAnomalies(transactions)
  insights.push(...spendingAnomalies.slice(0, 2)) // Máximo 2 anomalias
  
  // 5. Padrões de dias da semana
  const weekdayPatterns = analyzeWeekdayPatterns(transactions)
  if (weekdayPatterns.length > 0) {
    insights.push(weekdayPatterns[0]) // Apenas o mais relevante
  }
  
  // 6. Análise de tendência
  if (monthlyData.length >= 3) {
    const last3Months = monthlyData.slice(-3)
    const avgBalance = last3Months.reduce((sum, m) => sum + m.balance, 0) / 3
    
    if (avgBalance > 0) {
      insights.push(`✅ Saldo médio positivo nos últimos 3 meses: R$ ${avgBalance.toFixed(2)}`)
    } else {
      insights.push(`⚠️ Saldo médio negativo nos últimos 3 meses: R$ ${avgBalance.toFixed(2)}`)
    }
  }
  
  return insights.filter(insight => insight.length > 0).slice(0, 6) // Máximo 6 insights
}

function detectSpendingAnomalies(transactions: any[]): string[] {
  const insights: string[] = []
  
  // Agrupar por categoria e calcular médias
  const categoryAverages = new Map<string, { total: number; count: number }>()
  
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      const category = t.categories?.name || 'Outros'
      const amount = Math.abs(t.amount)
      
      if (!categoryAverages.has(category)) {
        categoryAverages.set(category, { total: 0, count: 0 })
      }
      
      const data = categoryAverages.get(category)!
      data.total += amount
      data.count += 1
    })
  
  // Detectar gastos muito acima da média
  categoryAverages.forEach((data, category) => {
    if (data.count < 3) return // Precisa de pelo menos 3 transações
    
    const average = data.total / data.count
    const highSpendingTransactions = transactions
      .filter(t => t.type === 'debit' && (t.categories?.name || 'Outros') === category)
      .filter(t => Math.abs(t.amount) > average * 2) // Gasto 2x acima da média
    
    if (highSpendingTransactions.length > 0) {
      const maxTransaction = highSpendingTransactions.reduce((max, t) => 
        Math.abs(t.amount) > Math.abs(max.amount) ? t : max
      )
      
      insights.push(`🚨 Gasto atípico em ${category}: R$ ${Math.abs(maxTransaction.amount).toFixed(2)} (${((Math.abs(maxTransaction.amount) / average - 1) * 100).toFixed(0)}% acima da média)`)
    }
  })
  
  return insights.slice(0, 3) // Máximo 3 anomalias
}

function analyzeWeekdayPatterns(transactions: any[]): string[] {
  const insights: string[] = []
  
  const weekdayTotals = new Map<string, number>()
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      const date = new Date(t.date)
      const weekday = weekdays[date.getDay()]
      weekdayTotals.set(weekday, (weekdayTotals.get(weekday) || 0) + Math.abs(t.amount))
    })
  
  if (weekdayTotals.size >= 5) { // Pelo menos 5 dias diferentes
    const sortedDays = Array.from(weekdayTotals.entries())
      .sort((a, b) => b[1] - a[1])
    
    const [topDay, topAmount] = sortedDays[0]
    const totalSpending = Array.from(weekdayTotals.values()).reduce((sum, val) => sum + val, 0)
    const percentage = (topAmount / totalSpending) * 100
    
    if (percentage > 25) { // Mais de 25% dos gastos em um dia
      insights.push(`📅 ${topDay} é seu dia de maior gasto (${percentage.toFixed(1)}% do total - R$ ${topAmount.toFixed(2)})`)
    }
  }
  
  return insights
} 