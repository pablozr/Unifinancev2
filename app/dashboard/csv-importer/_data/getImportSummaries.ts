'use server'

import { createClient } from '@/lib/supabase/server'

export interface MonthlySummary {
  id: string
  month: number
  year: number
  total_income: number
  total_expenses: number
  net_balance: number
  transaction_count: number
}

export default async function getImportSummaries(importId: string): Promise<MonthlySummary[]> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('monthly_summaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('csv_import_id', importId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) {
      throw new Error('Erro ao buscar resumos')
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar resumos:', error)
    return []
  }
} 