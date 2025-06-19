/**
 * @fileoverview Utilitários para cálculos financeiros
 * @description Funções auxiliares para cálculos de percentuais, transformações e agregações
 */

import type { TransactionType, RecentTransaction, CategorySpending } from '../types'

/**
 * @function isRefundTransaction
 * @description Identifica se uma transação é um estorno/reembolso
 * @param {any} transaction - Transação a ser verificada
 * @returns {boolean} True se for estorno
 */
export const isRefundTransaction = (transaction: any): boolean => {
  const desc = transaction.description?.toLowerCase() || ''
  return desc.includes('estorno') || 
         desc.includes('refund') || 
         desc.includes('chargeback') || 
         desc.includes('reversal') ||
         desc.includes('cancelamento') ||
         desc.includes('devolução') ||
         desc.includes('reembolso')
}

/**
 * @function calculatePercentageChange
 * @description Calcula mudança percentual entre dois valores
 * @param {number} current - Valor atual
 * @param {number} previous - Valor anterior
 * @returns {number} Percentual de mudança
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * @function sumTransactionsByType
 * @description Soma transações por tipo
 * @param {any[]} transactions - Array de transações
 * @param {TransactionType} type - Tipo da transação
 * @returns {number} Soma total
 */
export const sumTransactionsByType = (transactions: any[], type: TransactionType): number => {
  const filtered = transactions.filter(t => {
    // Filtrar por tipo
    if (t.type !== type) return false
    
    // Se for receita (credit), excluir estornos
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
 * @param {any[]} transactions - Array de transações
 * @returns {number} Saldo total
 */
export const calculateTotalBalance = (transactions: any[]): number => {
  return transactions.reduce((sum, t) => {
    if (t.type === 'credit') {
      // Excluir estornos das receitas
      return isRefundTransaction(t) ? sum : sum + Number(t.amount)
    } else {
      return sum - Number(t.amount)
    }
  }, 0)
}

/**
 * @function transformTransaction
 * @description Transforma transação do Prisma para formato do frontend
 * @param {any} transaction - Transação do Prisma
 * @returns {RecentTransaction} Transação formatada
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
 * @description Agrupa e processa transações por categoria
 * @param {any[]} transactions - Array de transações com categorias
 * @returns {CategorySpending[]} Array de gastos por categoria
 */
export const groupTransactionsByCategory = (transactions: any[]): CategorySpending[] => {
  if (transactions.length === 0) return []

  // Agrupar por categoria
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

  // Converter para array e calcular percentuais
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
 * @description Função de auditoria para identificar problemas no saldo
 * @param {any[]} transactions - Array de transações
 * @param {number} expectedBalance - Saldo esperado
 * @returns {object} Relatório de auditoria
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