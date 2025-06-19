/**
 * @fileoverview UtilitÃ¡rios para cÃ¡lculos financeiros
 * @description FunÃ§Ãµes auxiliares para cÃ¡lculos de percentuais, transformaÃ§Ãµes e agregaÃ§Ãµes
 */

import type { TransactionType, RecentTransaction, CategorySpending } from '../types'

/**
 * @function isRefundTransaction
 * @description Identifica se uma transaÃ§Ã£o Ã© um estorno/reembolso
 * @param {any} transaction - TransaÃ§Ã£o a ser verificada
 * @returns {boolean} True se for estorno
 */
export const isRefundTransaction = (transaction: any): boolean => {
  const desc = transaction.description?.toLowerCase() || ''
  return desc.includes('estorno') || 
         desc.includes('refund') || 
         desc.includes('chargeback') || 
         desc.includes('reversal') ||
         desc.includes('cancelamento') ||
         desc.includes('devoluÃ§Ã£o') ||
         desc.includes('reembolso')
}

/**
 * @function calculatePercentageChange
 * @description Calcula mudanÃ§a percentual entre dois valores
 * @param {number} current - Valor atual
 * @param {number} previous - Valor anterior
 * @returns {number} Percentual de mudanÃ§a
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {return current > 0 ? 100 : 0}
  return ((current - previous) / previous) * 100
}

/**
 * @function sumTransactionsByType
 * @description Soma transaÃ§Ãµes por tipo
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @param {TransactionType} type - Tipo da transaÃ§Ã£o
 * @returns {number} Soma total
 */
export const sumTransactionsByType = (transactions: any[], type: TransactionType): number => {
  const filtered = transactions.filter(t => {
    if (t.type !== type) {return false}
    
    if (type === 'credit') {
      return !isRefundTransaction(t)
    }
    
    return true
  })
  
  const total = filtered.reduce((sum, t) => sum + Number(t.amount), 0)

  
  return total
}

/**
 * @function calculateTotalBalance
 * @description Calcula saldo total (receitas - despesas)
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @returns {number} Saldo total
 */
export const calculateTotalBalance = (transactions: any[]): number => {
  return transactions.reduce((sum, t) => {
    if (t.type === 'credit') {
      return isRefundTransaction(t) ? sum : sum + Number(t.amount)
    } else {
      return sum - Number(t.amount)
    }
  }, 0)
}

/**
 * @function transformTransaction
 * @description Transforma transaÃ§Ã£o do Prisma para formato do frontend
 * @param {any} transaction - TransaÃ§Ã£o do Prisma
 * @returns {RecentTransaction} TransaÃ§Ã£o formatada
 */
export const transformTransaction = (transaction: any): RecentTransaction => ({
  id: transaction.id,
  description: transaction.description,
  amount: Number(transaction.amount),
  type: transaction.type === 'credit' ? 'income' : 'expense',
  date: transaction.date,
  categoryName: transaction.categories?.name,
  categoryColor: transaction.categories?.color
})

/**
 * @function calculateCategoryPercentages
 * @description Calcula percentuais para dados de categoria
 * @param {Array} categories - Array de categorias com totais
 * @returns {Array} Categorias com percentuais calculados
 */
export const calculateCategoryPercentages = (categories: any[]) => {
  const total = categories.reduce((sum, cat) => sum + cat.total, 0)
  
  return categories.map(cat => ({
    ...cat,
    percentage: total > 0 ? (cat.total / total) * 100 : 0
  }))
}

/**
 * @function groupTransactionsByCategory
 * @description Agrupa e processa transaÃ§Ãµes por categoria
 * @param {any[]} transactions - Array de transaÃ§Ãµes com categorias
 * @returns {CategorySpending[]} Array de gastos por categoria
 */
export const groupTransactionsByCategory = (transactions: any[]): CategorySpending[] => {
  if (transactions.length === 0) {return []}

  const categoryMap = new Map<string, {
    name: string
    total: number
    count: number
    color: string
  }>()

  transactions.forEach((transaction: any) => {
    const categoryName = transaction.categories?.name || 'Sem categoria'
    const categoryColor = transaction.categories?.color || '#6B7280'
    const amount = Math.abs(Number(transaction.amount))

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        total: 0,
        count: 0,
        color: categoryColor
      })
    }

    const category = categoryMap.get(categoryName)!
    category.total += amount
    category.count += 1
  })

  const categories = Array.from(categoryMap.values())
  const categoriesWithPercentages = calculateCategoryPercentages(categories)

  return categoriesWithPercentages
    .map(cat => ({
      categoryName: cat.name,
      totalAmount: cat.total,
      transactionCount: cat.count,
      color: cat.color,
      percentage: cat.percentage
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
}

/**
 * @function auditBalance
 * @description FunÃ§Ã£o de auditoria para identificar problemas no saldo
 * @param {any[]} transactions - Array de transaÃ§Ãµes
 * @param {number} expectedBalance - Saldo esperado
 * @returns {object} RelatÃ³rio de auditoria
 */
export const auditBalance = (transactions: any[], expectedBalance: number) => {
  const credits = transactions.filter(t => t.type === 'credit' && !isRefundTransaction(t))
  const debits = transactions.filter(t => t.type === 'debit')
  
  const totalCredits = credits.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalDebits = debits.reduce((sum, t) => sum + Number(t.amount), 0)
  const calculatedBalance = totalCredits - totalDebits
  const difference = expectedBalance - calculatedBalance
  
  return {
    totalTransactions: transactions.length,
    credits: {
      count: credits.length,
      total: totalCredits,
      transactions: credits.slice(0, 5) // Primeiras 5 para debug
    },
    debits: {
      count: debits.length,
      total: totalDebits,
      transactions: debits.slice(0, 5) // Primeiras 5 para debug
    },
    calculatedBalance,
    expectedBalance,
    difference,
    percentageDifference: ((difference / expectedBalance) * 100).toFixed(2)
    }
} 
