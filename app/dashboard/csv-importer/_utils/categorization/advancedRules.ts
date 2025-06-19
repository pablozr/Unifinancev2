import normalizeText from './textNormalizer'
import type { RawBankStatement } from '../../_types/types'

export interface CategorizedTransaction extends RawBankStatement {
  detectedCategory?: string
  categoryConfidence?: number
  categoryId?: string
}

/**
 * Aplica regras avanÃ§adas de categorizaÃ§Ã£o baseadas em padrÃµes
 */
export default function applyAdvancedRules(transactions: CategorizedTransaction[]): CategorizedTransaction[] {
  return transactions.map(transaction => {
    let updatedTransaction = { ...transaction }
    
    if (transaction.type === 'credit' && transaction.amount > 2000) {
      updatedTransaction.detectedCategory = 'Outros' // Manter genÃ©rico para receitas altas
      updatedTransaction.categoryConfidence = 80
    }
    
    const desc = normalizeText(transaction.description)
    if (desc.includes('transferencia') || desc.includes('ted') || desc.includes('pix')) {
      updatedTransaction.detectedCategory = 'Outros'
      updatedTransaction.categoryConfidence = 90
    }
    
    if (desc.includes('saque') || desc.includes('atm') || desc.includes('caixa eletronico')) {
      updatedTransaction.detectedCategory = 'Outros'
      updatedTransaction.categoryConfidence = 85
    }
    
    if (desc.includes('cartao') || desc.includes('card') || desc.includes('credito') || desc.includes('debito')) {
      if (!transaction.categoryConfidence || transaction.categoryConfidence < 50) {
        updatedTransaction.detectedCategory = 'Outros'
        updatedTransaction.categoryConfidence = 70
      }
    }
    
    return updatedTransaction
  })
} 
