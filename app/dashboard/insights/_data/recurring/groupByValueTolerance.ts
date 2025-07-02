import type { Transaction } from './types'
import { VALUE_TOLERANCE_PERCENTAGE } from './config'

/**
 * Agrupa transações por valor similar (com tolerância)
 */
export default function groupByValueTolerance(
  transactions: Transaction[],
): Transaction[][] {
  const groups: Transaction[][] = []

  for (const transaction of transactions) {
    let foundGroup = false

    for (const group of groups) {
      const referenceValue = group[0].amount
      const difference = Math.abs(transaction.amount - referenceValue)
      const tolerance = referenceValue * VALUE_TOLERANCE_PERCENTAGE

      if (difference <= tolerance) {
        group.push(transaction)
        foundGroup = true
        break
      }
    }

    if (!foundGroup) {
      groups.push([transaction])
    }
  }

  return groups
} 