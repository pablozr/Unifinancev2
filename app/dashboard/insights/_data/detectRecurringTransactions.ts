import { normalizeDescription } from './utils'
import type { ClassifiedTransaction, Transaction } from './recurring/types'
import { MIN_TRANSACTIONS_FOR_RECURRENCE } from './recurring/config'
import groupByValueTolerance from './recurring/groupByValueTolerance'
import hasFrequencyPattern from './recurring/hasFrequencyPattern'

export default function detectRecurringTransactions(
  transactions: Transaction[],
): ClassifiedTransaction[] {
  if (!transactions || transactions.length < MIN_TRANSACTIONS_FOR_RECURRENCE) {
    return transactions.map(t => ({ ...t, isRecurring: false }))
  }

  // 1. Agrupar por descrição normalizada (sem considerar valor exato)
  const groupedByDescription = new Map<string, Transaction[]>()

  for (const t of transactions) {
    const key = normalizeDescription(t.description)
    if (!groupedByDescription.has(key)) {
      groupedByDescription.set(key, [])
    }
    groupedByDescription.get(key)!.push(t)
  }

  const recurringTransactionIds = new Set<string>()

  // 2. Analisar cada grupo
  for (const [, group] of groupedByDescription.entries()) {
    if (group.length < MIN_TRANSACTIONS_FOR_RECURRENCE) {
      continue
    }

    // 2.1. Subgrupar por valor similar (com tolerância)
    const valueGroups = groupByValueTolerance(group)

    for (const valueGroup of valueGroups) {
      if (valueGroup.length < MIN_TRANSACTIONS_FOR_RECURRENCE) {
        continue
      }

      // 2.2. Verificar se há padrão de frequência
      if (hasFrequencyPattern(valueGroup)) {
        valueGroup.forEach(t => recurringTransactionIds.add(t.id))
      }
    }
  }

  return transactions.map(t => ({
    ...t,
    isRecurring: recurringTransactionIds.has(t.id),
  }))
} 