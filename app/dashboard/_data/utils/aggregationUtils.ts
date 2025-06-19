/**
 * @fileoverview UtilitÃ¡rios para agregaÃ§Ãµes e agrupamentos
 * @description FunÃ§Ãµes para processar e agrupar dados de transaÃ§Ãµes
 */

import { generateMonthKey, generateMonthLabel } from './insightUtils'
import { isRefundTransaction } from './calculationUtils'

/**
 * @interface MonthlyGroup
 * @description Estrutura para agrupamento mensal
 */
interface MonthlyGroup {
  income: number
  expenses: number
  month: string
  transactionCount: number
}

/**
 * @interface CategoryGroup
 * @description Estrutura para agrupamento por categoria
 */
interface CategoryGroup {
  name: string
  total: number
  count: number
  color: string
}

/**
 * @function groupTransactionsByMonth
 * @description Agrupa transaÃ§Ãµes por mÃªs
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @returns {Map<string, MonthlyGroup>} Mapa de grupos mensais
 */
export const groupTransactionsByMonth = (transactions: any[]): Map<string, MonthlyGroup> => {
  const monthlyGroups = new Map<string, MonthlyGroup>()
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    const monthKey = generateMonthKey(date)
    const monthLabel = generateMonthLabel(date)
    
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, {
        income: 0,
        expenses: 0,
        month: monthLabel,
        transactionCount: 0
      })
    }
    
    const group = monthlyGroups.get(monthKey)!
    const amount = Number(transaction.amount)
    
    if (transaction.type === 'credit') {
      if (!isRefundTransaction(transaction)) {
        group.income += amount
      }
    } else if (transaction.type === 'debit') {
      group.expenses += amount
    }
    
    group.transactionCount += 1
  })
  
  return monthlyGroups
}

/**
 * @function groupTransactionsByCategory
 * @description Agrupa transaÃ§Ãµes por categoria
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @returns {Map<string, CategoryGroup>} Mapa de grupos por categoria
 */
export const groupTransactionsByCategory = (transactions: any[]): Map<string, CategoryGroup> => {
  const categoryGroups = new Map<string, CategoryGroup>()
  
  transactions.forEach(transaction => {
    const categoryKey = transaction.category_id || 'no-category'
    const categoryName = transaction.categories?.name || 'Sem categoria'
    const categoryColor = transaction.categories?.color || '#6B7280'
    const amount = Math.abs(Number(transaction.amount))
    
    if (!categoryGroups.has(categoryKey)) {
      categoryGroups.set(categoryKey, {
        name: categoryName,
        total: 0,
        count: 0,
        color: categoryColor
      })
    }
    
    const group = categoryGroups.get(categoryKey)!
    group.total += amount
    group.count += 1
  })
  
  return categoryGroups
}

/**
 * @function aggregateTransactionsByType
 * @description Agrega transaÃ§Ãµes por tipo
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @returns {object} Objeto com totais por tipo
 */
export const aggregateTransactionsByType = (transactions: any[]) => {
  return transactions.reduce((acc, transaction) => {
    const amount = Number(transaction.amount)
    
    if (transaction.type === 'credit') {
      if (!isRefundTransaction(transaction)) {
        acc.income += amount
        acc.incomeCount += 1
      }
    } else if (transaction.type === 'debit') {
      acc.expenses += amount
      acc.expenseCount += 1
    }
    
    acc.total += amount
    acc.totalCount += 1
    
    return acc
  }, {
    income: 0,
    expenses: 0,
    total: 0,
    incomeCount: 0,
    expenseCount: 0,
    totalCount: 0
  })
}

/**
 * @function filterTransactionsByType
 * @description Filtra e agrega transaÃ§Ãµes por tipo especÃ­fico
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @param {'credit' | 'debit'} type - Tipo de transaÃ§Ã£o
 * @returns {object} Dados agregados do tipo
 */
export const filterTransactionsByType = (transactions: any[], type: 'credit' | 'debit') => {
  const filteredTransactions = transactions.filter(t => {
    if (t.type !== type) return false
    if (type === 'credit') {
      return !isRefundTransaction(t)
    }
    return true
  })
  const total = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
  
  return {
    transactions: filteredTransactions,
    total,
    count: filteredTransactions.length,
    average: filteredTransactions.length > 0 ? total / filteredTransactions.length : 0
  }
}

/**
 * @function calculateRunningBalance
 * @description Calcula saldo acumulado de transaÃ§Ãµes
 * @param {any[]} transactions - Array de transaÃ§Ãµes ordenadas por data
 * @param {number} initialBalance - Saldo inicial
 * @returns {object[]} Array com saldo acumulado
 */
export const calculateRunningBalance = (transactions: any[], initialBalance = 0) => {
  let runningBalance = initialBalance
  
  return transactions.map(transaction => {
    const amount = Number(transaction.amount)
    
    if (transaction.type === 'credit') {
      if (!isRefundTransaction(transaction)) {
        runningBalance += amount
      }
    } else if (transaction.type === 'debit') {
      runningBalance -= amount
    }
    
    return {
      ...transaction,
      runningBalance
    }
  })
}

/**
 * @function generateEmptyPeriods
 * @description Gera perÃ­odos vazios para preencher gaps nos dados
 * @param {Date} startDate - Data inicial
 * @param {Date} endDate - Data final
 * @param {'month' | 'day'} interval - Intervalo
 * @returns {Array} Array de perÃ­odos vazios
 */
export const generateEmptyPeriods = (
  startDate: Date,
  endDate: Date,
  interval: 'month' | 'day' = 'month'
) => {
  const periods = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    if (interval === 'month') {
      periods.push({
        key: generateMonthKey(current),
        label: generateMonthLabel(current),
        date: new Date(current)
      })
      current.setMonth(current.getMonth() + 1)
    } else {
      periods.push({
        key: current.toISOString().split('T')[0],
        label: current.toLocaleDateString('pt-BR'),
        date: new Date(current)
      })
      current.setDate(current.getDate() + 1)
    }
  }
  
  return periods
} 
