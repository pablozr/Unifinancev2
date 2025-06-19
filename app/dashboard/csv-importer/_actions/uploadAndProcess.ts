'use server'

import { createClient } from '@/lib/supabase/server'
import { transformToMonthlyData } from './transformer'
import { revalidatePath } from 'next/cache'

// Imports dos novos módulos
import validateFile from '../_utils/fileValidation'
import checkDuplicates from '../_utils/duplicateHandler'
import processCSV from '../_utils/csvProcessor'
import processAutoCategorization from '../_utils/categorizationProcessor'
import createImportRecord from '../_data/createImportRecord'
import saveTransactions from '../_data/saveTransactions'
import calculateCategoryStats from '../_utils/statsCalculator'

export interface UploadResult {
  success: boolean
  error?: string
  importId?: string
  isUpdate?: boolean
  message?: string
  data?: {
    totalRows: number
    validRows: number
    monthlyData: any[]
    categorizedTransactions?: number
    categoryStats?: Record<string, { count: number; avgConfidence: number }>
  }
}

export default async function uploadAndProcess(formData: FormData): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    
    // 1. Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const file = formData.get('file') as File
    
    // 2. Validar arquivo
    const fileValidation = await validateFile(file)
    if (!fileValidation.isValid) {
      return { success: false, error: fileValidation.error }
    }

    const { fileBuffer, fileHash } = fileValidation
    
    // 3. Verificar duplicados
    const duplicateCheck = await checkDuplicates(user.id, fileHash!)
    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: duplicateCheck.error,
        isUpdate: true
      }
    }

    // 4. Processar CSV
    const csvResult = await processCSV(fileBuffer!, file.name)
    if (!csvResult.success) {
      return { success: false, error: csvResult.error }
    }

    const { processedTransactions, totalRows, validRows } = csvResult
    
    // 5. Aplicar categorização automática
    const categorizationResult = await processAutoCategorization(
      processedTransactions!, 
      user.id
    )
    if (!categorizationResult.success) {
      return { success: false, error: categorizationResult.error }
    }

    const finalTransactions = categorizationResult.categorizedTransactions!
    
    // 6. Transformar em dados mensais
    const monthlyData = transformToMonthlyData(finalTransactions)
    console.log('📅 Dados mensais gerados:', monthlyData.length, 'meses')
    
    // 7. Criar registro de import
    const importResult = await createImportRecord(
      user.id,
      file.name,
      file.size,
      fileHash!,
      totalRows!,
      validRows!
    )
    if (!importResult.success) {
      return { success: false, error: importResult.error }
    }

    const { csvImport, finalHash, finalFilename } = importResult

    // 8. Salvar transações no banco
    const saveResult = await saveTransactions(
      finalTransactions,
      user.id,
      csvImport!.id
    )
    if (!saveResult.success) {
      return { success: false, error: saveResult.error }
    }

    // 9. Calcular estatísticas
    const stats = calculateCategoryStats(finalTransactions)

    console.log('✅ Processamento concluído com sucesso!')
    console.log('📅 Meses processados:', monthlyData.length)

    revalidatePath('/dashboard/csv-importer')
    revalidatePath('/dashboard')
    
    return {
      success: true,
      importId: csvImport!.id,
      message: finalHash !== fileHash ? 
        'Upload realizado com sucesso (hash modificado para evitar conflito)!' : 
        'Upload realizado com sucesso!',
      data: {
        totalRows: totalRows!,
        validRows: validRows!,
        monthlyData: monthlyData,
        categorizedTransactions: stats.categorizedCount,
        categoryStats: stats.categoryStats
      }
    }

  } catch (error) {
    console.error('❌ Upload error:', error)
    return { 
      success: false, 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }
  }
} 