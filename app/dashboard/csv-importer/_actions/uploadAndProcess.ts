'use server'

import { createClient } from '@/lib/supabase/server'
import { transformToMonthlyData } from './transformer'
import { revalidatePath } from 'next/cache'

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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'UsuÃ¡rio nÃ£o autenticado' }
    }

    const file = formData.get('file') as File
    
    const fileValidation = await validateFile(file)
    if (!fileValidation.isValid) {
      return { success: false, error: fileValidation.error }
    }

    const { fileBuffer, fileHash } = fileValidation
    
    const duplicateCheck = await checkDuplicates(user.id, fileHash!)
    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        error: duplicateCheck.error,
        isUpdate: true
      }
    }

    const csvResult = await processCSV(fileBuffer!, file.name)
    if (!csvResult.success) {
      return { success: false, error: csvResult.error }
    }

    const { processedTransactions, totalRows, validRows } = csvResult
    
    const categorizationResult = await processAutoCategorization(
      processedTransactions!, 
      user.id
    )
    if (!categorizationResult.success) {
      return { success: false, error: categorizationResult.error }
    }

    const finalTransactions = categorizationResult.categorizedTransactions!
    
    const monthlyData = transformToMonthlyData(finalTransactions)
    
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

    const { csvImport, finalHash } = importResult

    const saveResult = await saveTransactions(
      finalTransactions,
      user.id,
      csvImport!.id
    )
    if (!saveResult.success) {
      return { success: false, error: saveResult.error }
    }

    const stats = calculateCategoryStats(finalTransactions)


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
    return { 
      success: false, 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }
  }
} 
