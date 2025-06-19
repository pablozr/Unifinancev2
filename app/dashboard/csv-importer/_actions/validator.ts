import { RawBankStatement } from "../_types/types"
import { isValidBrazilianDate, parseDateBR, formatDateBR } from "@/lib/utils/validDate"

export function validateBankStatement(data: any[]): {
    isValid: boolean
    errors: string[]
    validRows: RawBankStatement[]
  } {
    const errors: string[] = []
    const validRows: RawBankStatement[] = []
    
  
    data.forEach((row, index) => {
      try {
        if (!row.date) {
          errors.push(`Linha ${index + 1}: Data Ã© obrigatÃ³ria`)
          return
        }
        if (!row.amount && row.amount !== 0) {
          errors.push(`Linha ${index + 1}: Valor Ã© obrigatÃ³rio`)
          return
        }
        
        if (!isValidBrazilianDate(row.date)) {
          errors.push(`Linha ${index + 1}: Formato de data invÃ¡lido: ${row.date}`)
          return
        }
        
        const parsedDate = parseDateBR(row.date)
        if (!parsedDate) {
          errors.push(`Linha ${index + 1}: Erro ao processar data: ${row.date}`)
          return
        }
        
        if (typeof row.amount !== 'number' || isNaN(row.amount)) {
          errors.push(`Linha ${index + 1}: Valor deve ser um nÃºmero vÃ¡lido: ${row.amount}`)
          return
        }
        
        if (!row.type || !['credit', 'debit'].includes(row.type)) {
          errors.push(`Linha ${index + 1}: Tipo deve ser 'credit' ou 'debit': ${row.type}`)
          return
        }
        
        validRows.push({
          date: formatDateBR(parsedDate), // Manter formato brasileiro consistente
          description: row.description || 'TransaÃ§Ã£o sem descriÃ§Ã£o',
          amount: Math.abs(row.amount), // Garantir que Ã© positivo
          type: row.type,
          category: row.category
        })
        
      } catch (error) {
        errors.push(`Linha ${index + 1}: Erro no processamento: ${error}`)
      }
    })
    
    if (errors.length > 0) {
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      validRows
    }
}



