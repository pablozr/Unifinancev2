import type { Transaction } from './types'
import { FREQUENCY_PATTERNS, MIN_TRANSACTIONS_FOR_RECURRENCE } from './config'

/**
 * Verifica se um grupo de transações tem padrão de frequência
 */
export default function hasFrequencyPattern(transactions: Transaction[]): boolean {
  if (transactions.length < MIN_TRANSACTIONS_FOR_RECURRENCE) {
    return false
  }

  // Ordenar por data
  const sorted = transactions.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Calcular intervalos entre transações consecutivas
  const intervals: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const dateA = new Date(sorted[i - 1].date).getTime()
    const dateB = new Date(sorted[i].date).getTime()
    const diffDays = (dateB - dateA) / (1000 * 60 * 60 * 24)
    intervals.push(diffDays)
  }

  // Verificar se os intervalos correspondem a algum padrão conhecido
  for (const pattern of FREQUENCY_PATTERNS) {
    const matchingIntervals = intervals.filter(
      interval => Math.abs(interval - pattern.days) <= pattern.tolerance,
    )

    // Se a maioria dos intervalos corresponde ao padrão (>= 70%)
    if (matchingIntervals.length >= intervals.length * 0.7) {
      return true
    }
  }

  // Verificar consistência: se os intervalos são similares entre si
  if (intervals.length >= 2) {
    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const consistentIntervals = intervals.filter(
      interval => Math.abs(interval - avgInterval) <= avgInterval * 0.3, // 30% de tolerância
    )

    // Se 70% ou mais dos intervalos são consistentes
    return consistentIntervals.length >= intervals.length * 0.7
  }

  return false
} 