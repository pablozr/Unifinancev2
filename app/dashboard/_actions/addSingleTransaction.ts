'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateTransactionData {
  description: string
  type: 'credit' | 'debit'
  amount: number
  category?: string
  date?: Date
}

export interface CreateTransactionResult {
  success: boolean
  transactionId?: string
  error?: string
}

export default async function addSingleTransaction(
  data: CreateTransactionData
): Promise<CreateTransactionResult> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'UsuÃ¡rio nÃ£o autenticado' }
    }

    if (!data.description || !data.description.trim()) {
      return { success: false, error: 'DescriÃ§Ã£o Ã© obrigatÃ³ria' }
    }

    if (!data.type || (data.type !== 'credit' && data.type !== 'debit')) {
      return { success: false, error: 'Tipo de transaÃ§Ã£o invÃ¡lido' }
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Valor deve ser maior que zero' }
    }

    const transactionData = {
      user_id: user.id,
      description: data.description.trim(),
      type: data.type,
      amount: data.amount,
      category: data.category || null,
      date: (data.date || new Date()).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }


    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select('id')
      .single()

    if (error) {
      return { success: false, error: `Erro ao criar transaÃ§Ã£o: ${error.message}` }
    }


    revalidatePath('/dashboard')
    revalidatePath('/dashboard/insights')

    return { 
      success: true, 
      transactionId: transaction.id 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Erro inesperado ao criar transaÃ§Ã£o'
    }
  }
} 
