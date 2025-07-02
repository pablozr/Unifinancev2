'use server'

import type { PeriodFilter } from '@/app/dashboard/_data/types'
import { queryTransactions } from '@/app/dashboard/_data/utils/queryBuilder'
import detectRecurringTransactions from './detectRecurringTransactions'
import type { ClassifiedTransaction } from './recurring/types'

export interface ExpenseBreakdown {
  fixed: number
  variable: number
  recurringTransactions: ClassifiedTransaction[]
}

/**
 * Busca e analisa todas as despesas (transações de débito) de um usuário
 * em um determinado período para classificar entre fixas e variáveis.
 *
 * @param userId O ID do usuário.
 * @param filter O filtro de período (opcional).
 * @returns Um objeto com o total de despesas fixas e variáveis, e as transações recorrentes.
 */
export async function getExpenseBreakdown(
  userId: string,
  filter?: PeriodFilter
): Promise<ExpenseBreakdown> {
  // 1. Busca todas as transações de débito (despesas) sem limite de paginação
  const transactions = await queryTransactions({
    userId,
    filter,
    transactionType: 'debit', // Apenas despesas
  })

  // 2. Utiliza o algoritmo para classificar as transações
  const classifiedTransactions = detectRecurringTransactions(transactions)

  // 3. Calcula o total de despesas fixas e variáveis
  const breakdown = classifiedTransactions.reduce(
    (acc, t) => {
      if (t.isRecurring) {
        acc.fixed += t.amount
      } else {
        acc.variable += t.amount
      }
      return acc
    },
    { fixed: 0, variable: 0, recurringTransactions: [] as ClassifiedTransaction[] }
  )

  // 4. Adiciona apenas as transações recorrentes à resposta
  breakdown.recurringTransactions = classifiedTransactions.filter(t => t.isRecurring)

  return breakdown
} 