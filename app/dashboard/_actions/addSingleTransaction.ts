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
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Validar dados
    if (!data.description || !data.description.trim()) {
      return { success: false, error: 'Descrição é obrigatória' }
    }

    if (!data.type || (data.type !== 'credit' && data.type !== 'debit')) {
      return { success: false, error: 'Tipo de transação inválido' }
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Valor deve ser maior que zero' }
    }

    // Preparar dados para inserção
    const transactionData = {
      user_id: user.id,
      description: data.description.trim(),
      type: data.type,
      amount: data.amount,
      category: data.category || null,
      date: (data.date || new Date()).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }

    console.log('💰 Criando transação:', transactionData)

    // Inserir transação
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select('id')
      .single()

    if (error) {
      console.error('❌ Erro ao criar transação:', error)
      return { success: false, error: `Erro ao criar transação: ${error.message}` }
    }

    console.log('✅ Transação criada com sucesso:', transaction.id)

    // Revalidar caches
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/insights')

    return { 
      success: true, 
      transactionId: transaction.id 
    }

  } catch (error) {
    console.error('❌ Erro inesperado ao criar transação:', error)
    return { 
      success: false, 
      error: 'Erro inesperado ao criar transação'
    }
  }
} 