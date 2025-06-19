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
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (!transactionId || !transactionId.trim()) {
      return { success: false, error: 'ID da transação é obrigatório' }
    }

    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('id, description, amount, type')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (findError) {
      return { success: false, error: 'Transação não encontrada ou sem permissão' }
    }

    if (!transaction) {
      return { success: false, error: 'Transação não encontrada' }
    }

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { success: false, error: `Erro ao deletar transação: ${deleteError.message}` }
    }

    revalidateDashboardPaths()

    return { 
      success: true, 
      transactionId: transactionId 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Erro inesperado ao deletar transação'
    }
  }
} 