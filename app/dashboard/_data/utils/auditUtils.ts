/**
 * @fileoverview UtilitÃ¡rios para auditoria de transaÃ§Ãµes
 * @description FunÃ§Ãµes para identificar e corrigir inconsistÃªncias nos dados financeiros
 */

import { isRefundTransaction } from './calculationUtils'

type Transaction = any

/**
 * @interface DuplicateGroup
 * @description Grupo de transaÃ§Ãµes potencialmente duplicadas
 */
export interface DuplicateGroup {
  key: string
  amount: number
  type: 'credit' | 'debit'
  count: number
  transactions: Transaction[]
  totalImpact: number
}

/**
 * @interface AuditReport
 * @description RelatÃ³rio completo de auditoria
 */
export interface AuditReport {
  totalTransactions: number
  calculatedBalance: number
  expectedBalance: number
  difference: number
  duplicateGroups: DuplicateGroup[]
  highValueTransactions: Transaction[]
  suspiciousTransactions: Transaction[]
  recommendations: string[]
}

/**
 * @function findDuplicateTransactions
 * @description Encontra grupos de transaÃ§Ãµes potencialmente duplicadas
 * @param {Transaction[]} transactions - Array de transaÃ§Ãµes
 * @returns {DuplicateGroup[]} Grupos de duplicatas
 */
export const findDuplicateTransactions = (transactions: Transaction[]): DuplicateGroup[] => {
  const groups = new Map<string, Transaction[]>()
  
  transactions.forEach(transaction => {
    const key = `${transaction.type}-${transaction.amount}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(transaction)
  })
  
  return Array.from(groups.entries())
    .filter(([_, transactions]) => transactions.length > 1)
    .map(([key, transactions]) => {
      const [type, amountStr] = key.split('-')
      const amount = Number(amountStr)
      
      return {
        key,
        amount,
        type: type as 'credit' | 'debit',
        count: transactions.length,
        transactions,
        totalImpact: amount * (transactions.length - 1) // Impacto se removermos duplicatas
      }
    })
    .sort((a, b) => b.totalImpact - a.totalImpact) // Ordenar por maior impacto
}

/**
 * @function generateAuditReport
 * @description Gera um relatÃ³rio completo de auditoria
 * @param {Transaction[]} transactions - Array de transaÃ§Ãµes
 * @param {number} expectedBalance - Saldo esperado/real
 * @returns {AuditReport} RelatÃ³rio de auditoria
 */
export const generateAuditReport = (
  transactions: Transaction[], 
  expectedBalance: number
): AuditReport => {
  const calculatedBalance = transactions.reduce((sum, t) => {
    if (t.type === 'credit') {
      return isRefundTransaction(t) ? sum : sum + Number(t.amount)
    } else {
      return sum - Number(t.amount)
    }
  }, 0)
  
  const difference = calculatedBalance - expectedBalance
  const duplicateGroups = findDuplicateTransactions(transactions)
  
  const highValueTransactions = transactions
    .filter(t => Number(t.amount) > 500)
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10)
  
  const suspiciousTransactions = transactions.filter(t => {
    const amount = Number(t.amount)
    return isNaN(amount) || amount < 0 || amount > 10000
  })
  
  const recommendations: string[] = []
  
  if (duplicateGroups.length > 0) {
    recommendations.push(`Encontradas ${duplicateGroups.length} grupos de possÃ­veis duplicatas`)
    
    const majorDuplicate = duplicateGroups[0]
    if (majorDuplicate.totalImpact > Math.abs(difference) * 0.5) {
      recommendations.push(`A duplicata de R$ ${majorDuplicate.amount} pode explicar grande parte da diferenÃ§a`)
    }
  }
  
  if (Math.abs(difference) > 100) {
    recommendations.push(`DiferenÃ§a significativa de R$ ${Math.abs(difference).toFixed(2)} identificada`)
  }
  
  if (suspiciousTransactions.length > 0) {
    recommendations.push(`${suspiciousTransactions.length} transaÃ§Ãµes com valores suspeitos encontradas`)
  }
  
  return {
    totalTransactions: transactions.length,
    calculatedBalance,
    expectedBalance,
    difference,
    duplicateGroups,
    highValueTransactions,
    suspiciousTransactions,
    recommendations
  }
}

/**
 * @function suggestCorrections
 * @description Sugere correÃ§Ãµes baseadas no relatÃ³rio de auditoria
 * @param {AuditReport} report - RelatÃ³rio de auditoria
 * @returns {string[]} Lista de correÃ§Ãµes sugeridas
 */
export const suggestCorrections = (report: AuditReport): string[] => {
  const corrections: string[] = []
  
  if (report.duplicateGroups.length > 0) {
    const topDuplicate = report.duplicateGroups[0]
    corrections.push(
      `Remover ${topDuplicate.count - 1} duplicata(s) de R$ ${topDuplicate.amount} (${topDuplicate.type}) - Impacto: R$ ${topDuplicate.totalImpact}`
    )
  }
  
  if (report.difference > 0) {
    corrections.push(`Sistema tem R$ ${report.difference.toFixed(2)} a mais - verificar receitas duplicadas`)
  } else if (report.difference < 0) {
    corrections.push(`Sistema tem R$ ${Math.abs(report.difference).toFixed(2)} a menos - verificar despesas nÃ£o registradas`)
  }
  
  return corrections
} 
