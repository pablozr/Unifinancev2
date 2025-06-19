'use server'

import { createClient } from '@/lib/supabase/server'

export interface CSVImport {
  id: string
  filename: string
  file_size: number
  total_rows: number
  valid_rows: number
  status: 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
}

export default async function getUserImports(): Promise<CSVImport[]> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('csv_imports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Erro ao buscar importações')
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar importações:', error)
    return []
  }
} 