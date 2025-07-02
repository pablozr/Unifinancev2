'use server'

import { queryTransactions } from '@/app/dashboard/_data/utils/queryBuilder'
import type { Database } from '@/lib/types/database'

export type Transaction = Database['public']['Tables']['transactions']['Row']
const DETECTION_PERIOD_DAYS = 90 // Usar os últimos 90 dias para detectar padrões

/**
 * Busca o histórico de transações de um usuário, necessário para a projeção.
 * @param userId O ID do usuário.
 * @returns Uma promessa com a lista de transações.
 */
export async function getCashFlowData(
  userId: string,
): Promise<Transaction[]> {
  const today = new Date()
  today.setHours(23, 59, 59, 999) // Fim do dia de hoje

  const startDate = new Date()
  startDate.setDate(today.getDate() - DETECTION_PERIOD_DAYS)
  startDate.setHours(0, 0, 0, 0) // Início do dia de 90 dias atrás

  const transactions = await queryTransactions({
    userId,
    filter: {
      type: 'custom',
      startDate: startDate,
      endDate: today,
    },
  })

  return transactions
}