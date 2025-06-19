'use server'

import deleteByPeriod from './deleteByPeriod'
import { clearAllImportRecords } from './clearImportRecords'
import type { DeleteResult } from './types'

/**
 * Deleta TODAS as transações em um período E os registros de import
 */
export default async function deleteImportedTransactions(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<DeleteResult> {
  console.log('🗑️ Iniciando exclusão completa do período...')
  
  // Deletar transações do período
  const result = await deleteByPeriod(userId, startDate, endDate)
  
  console.log('📊 Resultado da exclusão de transações:', result)
  
  // Deletar TODOS os registros de import do usuário para evitar conflitos
  try {
    await clearAllImportRecords(userId)
    console.log('✅ Registros de import também removidos')
  } catch (error) {
    console.error('⚠️ Erro ao limpar registros de import (transações já foram deletadas):', error)
  }
  
  return result
} 