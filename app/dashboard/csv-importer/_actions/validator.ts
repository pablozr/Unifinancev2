import { RawBankStatement } from "../_types/types"
import { isValidBrazilianDate, parseDateBR, formatDateBR } from "@/lib/utils/validDate"

export function validateBankStatement(data: any[]): {
    isValid: boolean
    errors: string[]
    validRows: RawBankStatement[]
  } {
    const errors: string[] = []
    const validRows: RawBankStatement[] = []
    
    console.log('Validando dados:', data.slice(0, 3)) // Log primeiras 3 linhas
  
    data.forEach((row, index) => {
      try {
        // Validar campos obrigatórios
        if (!row.date) {
          errors.push(`Linha ${index + 1}: Data é obrigatória`)
          return
        }
        if (!row.amount && row.amount !== 0) {
          errors.push(`Linha ${index + 1}: Valor é obrigatório`)
          return
        }
        
        // Processar e validar data usando função unificada
        if (!isValidBrazilianDate(row.date)) {
          errors.push(`Linha ${index + 1}: Formato de data inválido: ${row.date}`)
          return
        }
        
        const parsedDate = parseDateBR(row.date)
        if (!parsedDate) {
          errors.push(`Linha ${index + 1}: Erro ao processar data: ${row.date}`)
          return
        }
        
        // Validar valor
        if (typeof row.amount !== 'number' || isNaN(row.amount)) {
          errors.push(`Linha ${index + 1}: Valor deve ser um número válido: ${row.amount}`)
          return
        }
        
        // Validar tipo
        if (!row.type || !['credit', 'debit'].includes(row.type)) {
          errors.push(`Linha ${index + 1}: Tipo deve ser 'credit' ou 'debit': ${row.type}`)
          return
        }
        
        // Se chegou até aqui, a linha é válida
        validRows.push({
          date: formatDateBR(parsedDate), // Manter formato brasileiro consistente
          description: row.description || 'Transação sem descrição',
          amount: Math.abs(row.amount), // Garantir que é positivo
          type: row.type,
          category: row.category
        })
        
      } catch (error) {
        errors.push(`Linha ${index + 1}: Erro no processamento: ${error}`)
      }
    })
    
    console.log(`Validação concluída: ${validRows.length} válidas, ${errors.length} erros`)
    if (errors.length > 0) {
      console.log('Erros encontrados:', errors.slice(0, 5)) // Primeiros 5 erros
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      validRows
    }
}



