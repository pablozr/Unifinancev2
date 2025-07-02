'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateTransactionData {
  description: string
  type: 'credit' | 'debit'
  amount: number
  category?: string
  date?: Date
  is_recurring?: boolean
  recurring_frequency?: 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL'
  is_fixed?: boolean
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

    // Se for uma despesa recorrente, crie a recorrência
    if (data.is_recurring) {
      const recurringData = {
        user_id: user.id,
        description: data.description.trim(),
        category_id: null, // Você precisará de um lookup para o ID da categoria
        avg_amount: data.amount,
        frequency: data.recurring_frequency || 'MENSAL',
        billing_day: (data.date || new Date()).getDate(),
        is_fixed: data.is_fixed !== undefined ? data.is_fixed : true,
        is_active: true,
      };

      const { data: recurringExpense, error: recurringError } = await supabase
        .from('recurringexpenses')
        .insert([recurringData])
        .select('id')
        .single();

      if (recurringError) {
        // Opcional: deletar a transação criada se a criação da recorrência falhar
        await supabase.from('transactions').delete().match({ id: transaction.id });
        return { success: false, error: `Erro ao criar despesa recorrente: ${recurringError.message}` };
      }

      // Atualize a transação com o ID da recorrência
      await supabase
        .from('transactions')
        .update({ recurring_expense_id: recurringExpense.id })
        .match({ id: transaction.id });
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
