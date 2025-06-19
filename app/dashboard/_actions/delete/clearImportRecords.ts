'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardPaths } from './utils'

/**
 * Remove todos os registros de importaÃ§Ã£o do usuÃ¡rio (tabela csv_imports + storage)
 */
export async function clearAllImportRecords(userId: string): Promise<{ success: boolean; message: string }> {
  
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || user.id !== userId) {
    return {
      success: false,
      message: 'UsuÃ¡rio nÃ£o autorizado'
    }
  }

  try {
    const { data: imports, error: fetchError } = await supabase
      .from('csv_imports')
      .select('file_path')
      .eq('user_id', userId)

    if (fetchError) {
    } else if (imports && imports.length > 0) {
      
      for (const importRecord of imports) {
        try {
          const { error: storageError } = await supabase.storage
            .from('csv-files')
            .remove([importRecord.file_path])

          if (storageError) {
          } else {
          }
        } catch (error) {
        }
      }
    }

    const { error: importsError } = await supabase
      .from('csv_imports')
      .delete()
      .eq('user_id', userId)

    if (importsError) {
      throw importsError
    }

    
    revalidateDashboardPaths()

    return {
      success: true,
      message: 'Todos os registros de importaÃ§Ã£o e arquivos foram removidos'
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao limpar registros: ${error.message}`
    }
  }
}

/**
 * Remove importaÃ§Ã£o especÃ­fica por ID do csv_imports + storage
 */
export async function forceDeleteImportByHash(userId: string, fileHash: string): Promise<{ success: boolean; message: string }> {
  
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || user.id !== userId) {
    return {
      success: false,
      message: 'UsuÃ¡rio nÃ£o autorizado'
    }
  }

  try {
    const { data: imports, error: fetchError } = await supabase
      .from('csv_imports')
      .select('id, file_path, filename')
      .eq('user_id', userId)
      .or(`filename.ilike.%${fileHash}%,file_path.ilike.%${fileHash}%`)

    if (fetchError) {
      throw fetchError
    }

    if (!imports || imports.length === 0) {
      return {
        success: false,
        message: `Nenhum import encontrado com hash: ${fileHash}`
      }
    }

    for (const importRecord of imports) {
      try {
        const { error: storageError } = await supabase.storage
          .from('csv-files')
          .remove([importRecord.file_path])

        if (storageError) {
        } else {
        }

        const { error: deleteError } = await supabase
          .from('csv_imports')
          .delete()
          .eq('id', importRecord.id)
          .eq('user_id', userId)

        if (deleteError) {
        } else {
        }
      } catch (error) {
      }
    }

    
    revalidateDashboardPaths()

    return {
      success: true,
      message: `${imports.length} import(s) com hash "${fileHash}" foram removidos`
    }

  } catch (error: any) {
    return {
      success: false,
      message: `Erro ao remover import: ${error.message}`
    }
  }
} 
