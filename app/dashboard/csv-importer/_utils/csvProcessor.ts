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
    // Ler e processar o arquivo CSV
    const csvText = new TextDecoder('utf-8').decode(fileBuffer)
    console.log('📄 Processando CSV...')
    
    // Parse do CSV - parseCSV espera um File, então vamos criar um File temporário
    const csvFile = new File([csvText], fileName, { type: 'text/csv' })
    const parsedData = await parseCSV(csvFile)
    console.log('📊 Linhas parseadas:', parsedData.length)
    
    // Validar dados - validateBankStatement retorna { validRows, errors, isValid }
    const validatedData = validateBankStatement(parsedData)
    console.log('✅ Transações válidas:', validatedData.validRows.length)
    console.log('❌ Erros de validação:', validatedData.errors.length)
    
    if (validatedData.validRows.length === 0) {
      return { 
        success: false, 
        error: 'Nenhuma transação válida encontrada no arquivo. Verifique o formato dos dados.' 
      }
    }

    // Converter para ProcessedTransaction
    const processedTransactions: ProcessedTransaction[] = validatedData.validRows.map(transaction => {
      const parsedDate = parseDateBR(transaction.date)
      if (!parsedDate) {
        throw new Error(`Data inválida: ${transaction.date}`)
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