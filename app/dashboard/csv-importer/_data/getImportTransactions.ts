'use server'

import { createClient } from '@/lib/supabase/server'

export interface TransactionData {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  category?: string
  month: number
  year: number
}

export default async function getImportTransactions(importId: string): Promise<TransactionData[]> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('UsuÃ¡rio nÃ£o autenticado')
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('csv_import_id', importId)
      .order('date', { ascending: false })

    if (error) {
      throw new Error('Erro ao buscar transaÃ§Ãµes')
    }

    return data || []
  } catch (error) {
    return []
  }
} 
