import { createClient } from '@/lib/supabase/server'

export interface DuplicateCheckResult {
  isDuplicate: boolean
  error?: string
  existingImports?: any[]
}

export default async function checkDuplicates(
  userId: string, 
  fileHash: string
): Promise<DuplicateCheckResult> {
  try {
    const supabase = await createClient()
    
    
    const { data: existingImports, error: searchError } = await supabase
      .from('csv_imports')
      .select('*')
      .eq('user_id', userId)
      .eq('file_hash', fileHash)


    if (searchError) {
      return { isDuplicate: false, error: searchError.message }
    }

    if (existingImports && existingImports.length > 0) {
      return {
        isDuplicate: true,
        error: `Este arquivo jÃ¡ foi importado anteriormente (encontrado na csv_imports).\n\nHash: ${fileHash.substring(0, 16)}...\n\nUse a funÃ§Ã£o "Limpar Registros de Import" no dashboard para resolver.`,
        existingImports
      }
    }

    return { isDuplicate: false }
  } catch (error) {
    return { 
      isDuplicate: false, 
      error: `Erro ao verificar duplicados: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }
  }
} 
