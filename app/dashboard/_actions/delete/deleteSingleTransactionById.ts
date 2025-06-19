'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardPaths } from './utils'
import type { DeleteTransactionResult } from './types'

/**
 * Deleta uma única transação por ID
 */
export default async function deleteSingleTransactionById(
  transactionId: string
): Promise<DeleteTransactionResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Validar transactionId
    if (!transactionId || !transactionId.trim()) {
      return { success: false, error: 'ID da transação é obrigatório' }
    }

    console.log('🗑️ Deletando transação:', transactionId, 'para usuário:', user.id)

    // Primeiro, verificar se a transação existe e pertence ao usuário
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, description, amount, type')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (findError) {
      console.error('❌ Erro ao buscar transação:', findError)
      return { success: false, error: 'Transação não encontrada ou sem permissão' }
    }

    if (!transaction) {
      console.error('❌ Transação não encontrada para o usuário')
      return { success: false, error: 'Transação não encontrada' }
    }

    // Deletar a transação
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Erro ao deletar transação:', deleteError)
      return { success: false, error: `Erro ao deletar transação: ${deleteError.message}` }
    }

    console.log('✅ Transação deletada com sucesso:', transaction.description)

    // Revalidar caches
    revalidateDashboardPaths()

    return { 
      success: true, 
      transactionId: transactionId 
    }

  } catch (error) {
    console.error('❌ Erro inesperado ao deletar transação:', error)
    return { 
      success: false, 
      error: 'Erro inesperado ao deletar transação'
    }
  }
} 