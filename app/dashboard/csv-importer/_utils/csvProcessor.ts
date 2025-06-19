import { parseCSV } from '../_actions/parser'
import { validateBankStatement } from '../_actions/validator'
import { ProcessedTransaction } from '../_types/types'
import { v4 as uuidv4 } from 'uuid'
import { parseDateBR } from '@/lib/utils/validDate'

export interface CSVProcessResult {
  success: boolean
  error?: string
  processedTransactions?: ProcessedTransaction[]
  totalRows?: number
  validRows?: number
}

export default async function processCSV(
  fileBuffer: ArrayBuffer, 
  fileName: string
): Promise<CSVProcessResult> {
  try {
    const csvText = new TextDecoder('utf-8').decode(fileBuffer)
    
    const csvFile = new File([csvText], fileName, { type: 'text/csv' })
    const parsedData = await parseCSV(csvFile)
    
    const validatedData = validateBankStatement(parsedData)
    
    if (validatedData.validRows.length === 0) {
      return { 
        success: false, 
        error: 'Nenhuma transaÃ§Ã£o vÃ¡lida encontrada no arquivo. Verifique o formato dos dados.' 
      }
    }

    const processedTransactions: ProcessedTransaction[] = validatedData.validRows.map(transaction => {
      const parsedDate = parseDateBR(transaction.date)
      if (!parsedDate) {
        throw new Error(`Data invÃ¡lida: ${transaction.date}`)
      }
      
      return {
        id: uuidv4(),
        date: parsedDate,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear()
      }
    })

    return {
      success: true,
      processedTransactions,
      totalRows: parsedData.length,
      validRows: validatedData.validRows.length
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
} 
