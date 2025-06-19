'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateDashboardPaths } from './utils'

/**
 * Remove todos os registros de importação do usuário (tabela csv_imports + storage)
 */
export async function clearAllImportRecords(userId: string): Promise<{ success: boolean; message: string }> {
  console.log('🧹 Limpando registros de importação e storage...')
  
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || user.id !== userId) {
    console.error('❌ Erro de autenticação:', authError)
    return {
      success: false,
      message: 'Usuário não autorizado'
    }
  }

  try {
    // Primeiro, buscar os arquivos para limpar do storage
    const { data: imports, error: fetchError } = await supabase
      .from('csv_imports')
      .select('file_path')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('❌ Erro ao buscar imports para limpeza:', fetchError)
    } else if (imports && imports.length > 0) {
      console.log(`📁 Encontrados ${imports.length} arquivos para deletar do storage`)
      
      // Deletar arquivos do storage
      for (const importRecord of imports) {
        try {
          const { error: storageError } = await supabase.storage
            .from('csv-files')
            .remove([importRecord.file_path])

          if (storageError) {
            console.error('❌ Erro ao deletar arquivo do storage:', storageError)
          } else {
            console.log('🗑️ Arquivo deletado do storage:', importRecord.file_path)
          }
        } catch (error) {
          console.error('❌ Erro ao deletar do storage:', error)
        }
      }
    }

    // Deletar registros de csv_imports (CASCADE vai deletar transactions e monthly_summaries)
    const { error: importsError } = await supabase
      .from('csv_imports')
      .delete()
      .eq('user_id', userId)

    if (importsError) {
      console.error('❌ Erro ao deletar csv_imports:', importsError)
      throw importsError
    }

    console.log('✅ Registros de importação e storage limpos com sucesso')
    
    // Revalidar caches
    revalidateDashboardPaths()

    return {
      success: true,
      message: 'Todos os registros de importação e arquivos foram removidos'
    }

  } catch (error: any) {
    console.error('❌ Erro na limpeza:', error)
    return {
      success: false,
      message: `Erro ao limpar registros: ${error.message}`
    }
  }
}

/**
 * Remove importação específica por ID do csv_imports + storage
 */
export async function forceDeleteImportByHash(userId: string, fileHash: string): Promise<{ success: boolean; message: string }> {
  console.log('🗑️ Forçando exclusão de import por hash:', fileHash)
  
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user || user.id !== userId) {
    console.error('❌ Erro de autenticação:', authError)
    return {
      success: false,
      message: 'Usuário não autorizado'
    }
  }

  try {
    // Buscar import por hash do filename ou file_path
    const { data: imports, error: fetchError } = await supabase
      .from('csv_imports')
      .select('id, file_path, filename')
      .eq('user_id', userId)
      .or(`filename.ilike.%${fileHash}%,file_path.ilike.%${fileHash}%`)

    if (fetchError) {
      console.error('❌ Erro ao buscar imports por hash:', fetchError)
      throw fetchError
    }

    if (!imports || imports.length === 0) {
      return {
        success: false,
        message: `Nenhum import encontrado com hash: ${fileHash}`
      }
    }

    // Deletar arquivos do storage e registros do banco
    for (const importRecord of imports) {
      try {
        // Deletar do storage
        const { error: storageError } = await supabase.storage
          .from('csv-files')
          .remove([importRecord.file_path])

        if (storageError) {
          console.error('❌ Erro ao deletar arquivo do storage:', storageError)
        } else {
          console.log('🗑️ Arquivo deletado do storage:', importRecord.file_path)
        }

        // Deletar do banco (CASCADE vai deletar transactions e monthly_summaries)
        const { error: deleteError } = await supabase
          .from('csv_imports')
          .delete()
          .eq('id', importRecord.id)
          .eq('user_id', userId)

        if (deleteError) {
          console.error('❌ Erro ao deletar csv_import:', deleteError)
        } else {
          console.log('✅ Import removido do banco:', importRecord.filename)
        }
      } catch (error) {
        console.error('❌ Erro ao processar import:', importRecord.filename, error)
      }
    }

    console.log('✅ Imports removidos por hash')
    
    // Revalidar caches
    revalidateDashboardPaths()

    return {
      success: true,
      message: `${imports.length} import(s) com hash "${fileHash}" foram removidos`
    }

  } catch (error: any) {
    console.error('❌ Erro na exclusão por hash:', error)
    return {
      success: false,
      message: `Erro ao remover import: ${error.message}`
    }
  }
} 