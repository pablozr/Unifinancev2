/**
 * @fileoverview Utilitários específicos para insights
 * @description Funções auxiliares específicas para cálculos e transformações de insights
 */

import type { MonthlyData, CategoryData } from '../types'

/**
 * @function generateMonthLabel
 * @description Gera label formatado do mês em português
 * @param {Date} date - Data para gerar o label
 * @returns {string} Label do mês formatado
 */
export const generateMonthLabel = (date: Date): string => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                     'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * @function generateMonthKey
 * @description Gera chave única para agrupamento mensal
 * @param {Date} date - Data para gerar a chave
 * @returns {string} Chave no formato "YYYY-M"
 */
export const generateMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}`
}

/**
 * @function calculateAvgTicket
 * @description Calcula ticket médio das transações
 * @param {any[]} transactions - Array de transações
 * @returns {number} Valor do ticket médio
 */
export const calculateAvgTicket = (transactions: any[]): number => {
  if (transactions.length === 0) return 0
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0)
  return totalAmount / transactions.length
}

/**
 * @function filterMonthlyData
 * @description Filtra dados mensais baseado no filtro de período
 * @param {Map<string, any>} monthlyGroups - Grupos mensais
 * @param {any} filter - Filtro de período
 * @returns {Array} Entradas filtradas
 */
export const filterMonthlyData = (monthlyGroups: Map<string, any>, filter?: any) => {
  let sortedEntries = Array.from(monthlyGroups.entries()).sort(([a], [b]) => a.localeCompare(b))
  
  if (filter) {
    if (filter.type === 'yearly' && filter.year) {
      sortedEntries = sortedEntries.filter(([key]) => key.startsWith(filter.year!.toString()))
    } else if (filter.type === 'monthly' && filter.year && filter.month !== undefined) {
      const targetKey = `${filter.year}-${filter.month}`
      sortedEntries = sortedEntries.filter(([key]) => key === targetKey)
    }
  } else {
    // Padrão: últimos 6 meses
    sortedEntries = sortedEntries.slice(-6)
  }
  
  return sortedEntries
}

/**
 * @function transformToCategoryData
 * @description Transforma dados de categoria do Prisma para CategoryData
 * @param {Map<string, any>} categoryMap - Mapa de categorias
 * @returns {CategoryData[]} Array de dados de categoria
 */
export const transformToCategoryData = (categoryMap: Map<string, any>): CategoryData[] => {
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, data) => sum + data.total, 0)
  
  return Array.from(categoryMap.entries())
    .map(([key, data]) => ({
      label: data.name,
      value: data.total,
      color: data.color,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      transactionCount: data.count
    }))
    .sort((a, b) => b.value - a.value)
}

/**
 * @function buildCategoryMap
 * @description Constrói mapa de categorias a partir das transações
 * @param {any[]} transactions - Array de transações
 * @returns {Map<string, any>} Mapa de categorias
 */
export const buildCategoryMap = (transactions: any[]): Map<string, any> => {
  const categoryMap = new Map<string, any>()
  
  transactions.forEach(transaction => {
    const categoryKey = transaction.category_id || 'no-category'
    const categoryName = transaction.categories?.name || 'Sem categoria'
    const categoryColor = transaction.categories?.color || '#6B7280'
    const amount = Number(transaction.amount)

    if (categoryMap.has(categoryKey)) {
      const current = categoryMap.get(categoryKey)!
      current.total += amount
      current.count += 1
    } else {
      categoryMap.set(categoryKey, {
        name: categoryName,
        total: amount,
        color: categoryColor,
        count: 1
      })
    }
  })
  
  return categoryMap
} 