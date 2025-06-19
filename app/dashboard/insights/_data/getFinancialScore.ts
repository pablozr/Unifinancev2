'use server'
import { createClient } from '@/lib/supabase/server'
import type { PeriodFilter } from '../../_data/types'

export interface FinancialScore {
  overallScore: number
  savingsRate: number
  expenseStability: number
  categoryDiversification: number
  incomeConsistency: number
  debtToIncomeRatio: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}

export async function getFinancialScore(
  userId: string, 
  _filter: PeriodFilter = { type: 'custom' }
): Promise<FinancialScore> {
  const supabase = await createClient()
  
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
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
    .gte('date', sixMonthsAgo.toISOString())
    .order('date', { ascending: true })
    
  if (error || !transactions.length) {
    return {
      overallScore: 0,
      savingsRate: 0,
      expenseStability: 0,
      categoryDiversification: 0,
      incomeConsistency: 0,
      debtToIncomeRatio: 0,
      grade: 'F',
      recommendations: ['Adicione mais transaÃ§Ãµes para anÃ¡lise'],
      strengths: [],
      weaknesses: ['Dados insuficientes']
    }
  }

  const monthlyData = new Map<string, { income: number; expenses: number }>()
  const categoryExpenses = new Map<string, number>()
  
  transactions.forEach((transaction: any) => {
    const date = new Date(transaction.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0 })
    }
    
    const monthData = monthlyData.get(monthKey)!
    if (transaction.type === 'credit') {
      monthData.income += transaction.amount
    } else {
      monthData.expenses += Math.abs(transaction.amount)
      
      const categoryName = transaction.categories?.name || 'Outros'
      categoryExpenses.set(categoryName, (categoryExpenses.get(categoryName) || 0) + Math.abs(transaction.amount))
    }
  })
  
  const monthlyValues = Array.from(monthlyData.values())
  
  const totalIncome = monthlyValues.reduce((sum, m) => sum + m.income, 0)
  const totalExpenses = monthlyValues.reduce((sum, m) => sum + m.expenses, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  const savingsScore = Math.min(100, Math.max(0, savingsRate * 5)) // 20% = 100 pontos
  
  const avgExpenses = totalExpenses / monthlyValues.length
  const expenseVariance = monthlyValues.reduce((sum, m) => sum + Math.pow(m.expenses - avgExpenses, 2), 0) / monthlyValues.length
  const expenseStdDev = Math.sqrt(expenseVariance)
  const expenseStability = Math.max(0, 100 - (expenseStdDev / avgExpenses) * 100)
  
  const categoryCount = categoryExpenses.size
  const categoryDiversification = Math.min(100, categoryCount * 12.5) // 8 categorias = 100 pontos
  
  const avgIncome = totalIncome / monthlyValues.length
  const incomeVariance = monthlyValues.reduce((sum, m) => sum + Math.pow(m.income - avgIncome, 2), 0) / monthlyValues.length
  const incomeStdDev = Math.sqrt(incomeVariance)
  const incomeConsistency = Math.max(0, 100 - (incomeStdDev / avgIncome) * 100)
  
  const debtToIncomeRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100
  const debtScore = Math.max(0, 100 - debtToIncomeRatio)
  
  const overallScore = Math.round(
    (savingsScore * 0.3) +
    (expenseStability * 0.25) +
    (categoryDiversification * 0.2) +
    (incomeConsistency * 0.2) +
    (debtScore * 0.05)
  )
  
  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (overallScore >= 85) {grade = 'A'}
  else if (overallScore >= 70) {grade = 'B'}
  else if (overallScore >= 55) {grade = 'C'}
  else if (overallScore >= 40) {grade = 'D'}
  else {grade = 'F'}
  
  const recommendations: string[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []
  
  if (savingsScore >= 70) {
    strengths.push('Excelente taxa de poupanÃ§a')
  } else {
    weaknesses.push('Taxa de poupanÃ§a baixa')
    recommendations.push('Tente poupar pelo menos 20% da sua renda mensal')
  }
  
  if (expenseStability >= 70) {
    strengths.push('Gastos consistentes e previsÃ­veis')
  } else {
    weaknesses.push('Gastos muito variÃ¡veis')
    recommendations.push('Crie um orÃ§amento mensal para controlar melhor os gastos')
  }
  
  if (categoryDiversification >= 60) {
    strengths.push('Boa diversificaÃ§Ã£o de gastos')
  } else {
    weaknesses.push('Poucos tipos de gastos categorizados')
    recommendations.push('Categorize melhor suas transaÃ§Ãµes para melhor controle')
  }
  
  if (incomeConsistency >= 70) {
    strengths.push('Renda estÃ¡vel e consistente')
  } else {
    weaknesses.push('Renda muito variÃ¡vel')
    recommendations.push('Busque diversificar suas fontes de renda')
  }
  
  return {
    overallScore,
    savingsRate,
    expenseStability,
    categoryDiversification,
    incomeConsistency,
    debtToIncomeRatio,
    grade,
    recommendations,
    strengths,
    weaknesses
  }
} 
