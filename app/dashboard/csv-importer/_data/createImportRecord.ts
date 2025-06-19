import { createClient } from '@/lib/supabase/server'

export interface ImportRecordResult {
  success: boolean
  error?: string
  csvImport?: any
  finalHash?: string
  finalFilename?: string
}

export default async function createImportRecord(
  userId: string,
  filename: string,
  fileSize: number,
  fileHash: string,
  totalRows: number,
  validRows: number
): Promise<ImportRecordResult> {
  try {
    const supabase = await createClient()
    
    console.log('📝 Criando registro de import...')
    
    let finalHash = fileHash
    let finalFilename = filename
    
    const { data: csvImportData, error: importError } = await supabase
      .from('csv_imports')
      .insert({
        user_id: userId,
        filename: finalFilename,
        file_path: `${userId}/${finalFilename}`,
        file_size: fileSize,
        file_hash: finalHash,
        total_rows: totalRows,
        valid_rows: validRows,
        status: 'processing'
      })
      .select()
      .single()

    if (importError) {
      console.error('❌ Import error details:', importError)
      
      // Se for erro de constraint única, tentar workaround
      if (importError.code === '23505') {
        console.log('🔄 Erro de constraint única detectado, tentando workaround...')
        
        finalHash = `${fileHash}_${Date.now()}`
        finalFilename = `${Date.now()}_${filename}`
        
        const { data: csvImportRetry, error: retryError } = await supabase
          .from('csv_imports')
          .insert({
            user_id: userId,
            filename: finalFilename,
            file_path: `${userId}/${finalFilename}`,
            file_size: fileSize,
            file_hash: finalHash,
            total_rows: totalRows,
            valid_rows: validRows,
            status: 'processing'
          })
          .select()
          .single()
        
        if (retryError) {
          console.error('❌ Retry também falhou:', retryError)
          return { 
            success: false, 
            error: `Erro persistente: ${retryError.message}` 
          }
        }
        
        console.log('✅ Workaround funcionou com hash modificado')
        return {
          success: true,
          csvImport: csvImportRetry,
          finalHash,
          finalFilename
        }
      } else {
        return { 
          success: false, 
          error: `Erro ao criar registro de importação: ${importError.message}` 
        }
      }
    }

    return {
      success: true,
      csvImport: csvImportData,
      finalHash,
      finalFilename
    }
  } catch (error) {
    console.error('❌ Erro ao criar registro:', error)
    return { 
      success: false, 
      error: `Erro ao criar registro: ${error}` 
    }
  }
} 