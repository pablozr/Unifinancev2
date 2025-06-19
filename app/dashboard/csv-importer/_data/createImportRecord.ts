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
      
      if (importError.code === '23505') {
        
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
          return { 
            success: false, 
            error: `Erro persistente: ${retryError.message}` 
          }
        }
        
        return {
          success: true,
          csvImport: csvImportRetry,
          finalHash,
          finalFilename
        }
      } else {
        return { 
          success: false, 
          error: `Erro ao criar registro de importaÃ§Ã£o: ${importError.message}` 
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
    return { 
      success: false, 
      error: `Erro ao criar registro: ${error}` 
    }
  }
} 
