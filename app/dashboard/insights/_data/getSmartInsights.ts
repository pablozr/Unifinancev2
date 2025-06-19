'use server'
import { createActionClient, createClient } from '@/lib/supabase/server'
import { getDateRangeFromFilter } from '../../_data/utils/dateUtils'
import type { PeriodFilter } from '../../_data/types'

export interface SmartInsight {
  type: 'alert' | 'opportunity' | 'pattern' | 'achievement'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category?: string
  value?: number
  suggestion?: string
  icon: string
}

export interface SpendingPattern {
  pattern: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  amount: number
  category: string
  confidence: number
}

export async function getSmartInsights(
  userId: string, 
  filter: PeriodFilter = { type: 'custom' }
): Promise<SmartInsight[]> {
  const supabase = await createClient()
  
  // Aplicar filtro de período se fornecido
  let dateRange = getDateRangeFromFilter(filter)
  
  // Se não há range específico ou é um filtro custom, usar os últimos 3 meses para insights
  if (!dateRange || filter.type === 'custom') {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    dateRange = {
      start: threeMonthsAgo,
      end: new Date()
    }
  }
  
  console.log('🧠 Smart insights using date range:', {
    start: dateRange.start.toISOString(),
    end: dateRange.end.toISOString(),
    filterType: filter.type
  })
  
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
    
  if (error || !transactions.length) {
    console.log('🧠 No transactions found for insights analysis')
    return []
  }

  const insights: SmartInsight[] = []
  
  // Análise 1: Gastos Incomuns - Adaptado para o período filtrado
  const periodDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
  
  // Se o período for maior que 60 dias, comparar metades do período
  if (periodDays > 60) {
    const midPoint = new Date(dateRange.start.getTime() + (dateRange.end.getTime() - dateRange.start.getTime()) / 2)
    
    const firstHalfTransactions = transactions.filter(t => 
      new Date(t.date) >= dateRange.start && new Date(t.date) <= midPoint
    )
    const secondHalfTransactions = transactions.filter(t => 
      new Date(t.date) > midPoint && new Date(t.date) <= dateRange.end
    )
    
    const firstHalfExpenses = firstHalfTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const secondHalfExpenses = secondHalfTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    if (firstHalfExpenses > 0) {
      const expenseChange = ((secondHalfExpenses - firstHalfExpenses) / firstHalfExpenses) * 100
      
      if (expenseChange > 20) {
        insights.push({
          type: 'alert',
          title: 'Gastos Aumentaram no Período',
          description: `Seus gastos na segunda metade do período estão ${expenseChange.toFixed(1)}% acima da primeira metade`,
          impact: 'high',
          value: secondHalfExpenses - firstHalfExpenses,
          suggestion: 'Revise suas despesas recentes e identifique gastos desnecessários',
          icon: '⚠️'
        })
      } else if (expenseChange < -15) {
        insights.push({
          type: 'achievement',
          title: 'Ótimo Controle de Gastos!',
          description: `Você economizou ${Math.abs(expenseChange).toFixed(1)}% na segunda metade do período`,
          impact: 'high',
          value: firstHalfExpenses - secondHalfExpenses,
          suggestion: 'Continue com esse excelente controle financeiro!',
          icon: '🎉'
        })
      }
    }
  } else {
    // Para períodos menores, usar comparação com período anterior
    const previousRange = {
      start: new Date(dateRange.start.getTime() - periodDays * 24 * 60 * 60 * 1000),
      end: dateRange.start
    }
    
    const { data: previousTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', previousRange.start.toISOString())
      .lt('date', previousRange.end.toISOString())
    
    if (previousTransactions && previousTransactions.length > 0) {
      const currentExpenses = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      const previousExpenses = previousTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      if (previousExpenses > 0) {
        const expenseChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100
        
        if (expenseChange > 20) {
          insights.push({
            type: 'alert',
            title: 'Gastos Acima do Normal',
            description: `Seus gastos no período estão ${expenseChange.toFixed(1)}% acima do período anterior`,
            impact: 'high',
            value: currentExpenses - previousExpenses,
            suggestion: 'Revise suas despesas recentes e identifique gastos desnecessários',
            icon: '⚠️'
          })
        } else if (expenseChange < -15) {
          insights.push({
            type: 'achievement',
            title: 'Ótimo Controle de Gastos!',
            description: `Você economizou ${Math.abs(expenseChange).toFixed(1)}% em relação ao período anterior`,
            impact: 'high',
            value: previousExpenses - currentExpenses,
            suggestion: 'Continue com esse excelente controle financeiro!',
            icon: '🎉'
          })
        }
      }
    }
  }
  
  // Análise 2: Categoria com Maior Crescimento (adaptado para período filtrado)
  const categoryExpenses = new Map<string, number>()
  
  transactions.filter(t => t.type === 'debit').forEach(t => {
    const categoryName = t.categories?.name || 'Outros'
    categoryExpenses.set(categoryName, (categoryExpenses.get(categoryName) || 0) + Math.abs(t.amount))
  })
  
  // Oportunidades de Economia baseadas no período filtrado
  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  // Identificar categoria com maior gasto no período
  let maxCategory = ''
  let maxCategoryValue = 0
  categoryExpenses.forEach((value, category) => {
    if (value > maxCategoryValue) {
      maxCategoryValue = value
      maxCategory = category
    }
  })
  
  if (maxCategory && maxCategoryValue > totalExpenses * 0.3) { // Mais de 30% dos gastos
    insights.push({
      type: 'opportunity',
      title: `Oportunidade em ${maxCategory}`,
      description: `${maxCategory} representa ${((maxCategoryValue / totalExpenses) * 100).toFixed(1)}% dos seus gastos no período`,
      impact: 'medium',
      category: maxCategory,
      value: maxCategoryValue,
      suggestion: `Uma redução de 10% em ${maxCategory} resultaria em uma economia significativa`,
      icon: '💡'
    })
  }
  
  // Análise 3: Padrões de Gastos Recorrentes no período filtrado
  const recurringTransactions = new Map<string, { count: number; total: number; dates: Date[] }>()
  
  transactions.filter(t => t.type === 'debit').forEach(t => {
    const key = `${t.description.toLowerCase()}-${Math.abs(t.amount)}`
    if (!recurringTransactions.has(key)) {
      recurringTransactions.set(key, { count: 0, total: 0, dates: [] })
    }
    const recurring = recurringTransactions.get(key)!
    recurring.count++
    recurring.total += Math.abs(t.amount)
    recurring.dates.push(new Date(t.date))
  })
  
  // Encontrar transações que ocorrem múltiplas vezes no período
  recurringTransactions.forEach((data, key) => {
    if (data.count >= 2 && periodDays >= 30) { // Pelo menos 2 ocorrências em período de 30+ dias
      const [description] = key.split('-')
      const avgAmount = data.total / data.count
      
      // Verificar intervalos entre transações
      data.dates.sort((a, b) => a.getTime() - b.getTime())
      const intervals = []
      for (let i = 1; i < data.dates.length; i++) {
        const interval = (data.dates[i].getTime() - data.dates[i-1].getTime()) / (1000 * 60 * 60 * 24)
        intervals.push(interval)
      }
      
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
      
      if (avgInterval <= 35 && avgInterval >= 7) { // Entre 7 e 35 dias
        insights.push({
          type: 'pattern',
          title: 'Gasto Recorrente Identificado',
          description: `${description} acontece regularmente no período analisado`,
          impact: 'low',
          value: avgAmount,
          suggestion: 'Considere criar um orçamento específico para este gasto recorrente',
          icon: '🔄'
        })
      }
    }
  })
  
  // Análise 4: Taxa de Poupança no período filtrado
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
  
  if (savingsRate > 20) {
    insights.push({
      type: 'achievement',
      title: 'Excelente Taxa de Poupança!',
      description: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda no período`,
      impact: 'high',
      suggestion: 'Continue mantendo essa disciplina financeira!',
      icon: '💰'
    })
  } else if (savingsRate < 5 && totalIncome > 0) {
    insights.push({
      type: 'alert',
      title: 'Taxa de Poupança Baixa',
      description: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda no período`,
      impact: 'medium',
      suggestion: 'Considere revisar seus gastos para aumentar sua capacidade de poupança',
      icon: '📉'
    })
  }
  
  // Ordenar insights por impacto
  const impactOrder = { high: 3, medium: 2, low: 1 }
  insights.sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])
  
  console.log('🧠 Smart insights generated:', insights.length, 'insights for period')
  
  return insights.slice(0, 6) // Limitar a 6 insights mais relevantes
}

export async function getSpendingPatterns(
  userId: string, 
  filter: PeriodFilter = { type: 'custom' }
): Promise<SpendingPattern[]> {
  const supabase = createActionClient()
  
  // Aplicar filtro de período
  let dateRange = getDateRangeFromFilter(filter)
  
  if (!dateRange || filter.type === 'custom') {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    dateRange = {
      start: threeMonthsAgo,
      end: new Date()
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
    .eq('type', 'debit')
    .order('date', { ascending: true })
    
  if (error || !transactions.length) {
    return []
  }

  const patterns: SpendingPattern[] = []
  
  // Análise por dia da semana no período filtrado
  const weekdayExpenses = new Array(7).fill(0)
  const weekdayCount = new Array(7).fill(0)
  
  transactions.forEach(t => {
    const date = new Date(t.date)
    const weekday = date.getDay()
    weekdayExpenses[weekday] += Math.abs(t.amount)
    weekdayCount[weekday]++
  })
  
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  let maxWeekdayIndex = 0
  let maxWeekdayAmount = 0
  
  weekdayExpenses.forEach((amount, index) => {
    if (amount > maxWeekdayAmount) {
      maxWeekdayAmount = amount
      maxWeekdayIndex = index
    }
  })
  
  if (maxWeekdayAmount > 0) {
    patterns.push({
      pattern: `Mais gastos às ${weekdays[maxWeekdayIndex]}s`,
      description: `Você tende a gastar mais às ${weekdays[maxWeekdayIndex]}s no período analisado`,
      frequency: 'weekly',
      amount: maxWeekdayAmount,
      category: 'Geral',
      confidence: Math.min(95, (maxWeekdayAmount / weekdayExpenses.reduce((a, b) => a + b, 0)) * 100 * 7)
    })
  }
  
  return patterns
} 