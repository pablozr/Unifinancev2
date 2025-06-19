import normalizeText from './textNormalizer'
import type { RawBankStatement } from '../../_types/types'

export interface CategorizedTransaction extends RawBankStatement {
  detectedCategory?: string
  categoryConfidence?: number
  categoryId?: string
}

/**
 * Aplica regras avançadas de categorização baseadas em padrões
 */
export default function applyAdvancedRules(transactions: CategorizedTransaction[]): CategorizedTransaction[] {
  return transactions.map(transaction => {
    let updatedTransaction = { ...transaction }
    
    // Regra: Valores altos podem ser salário ou transferências
    if (transaction.type === 'credit' && transaction.amount > 2000) {
      updatedTransaction.detectedCategory = 'Outros' // Manter genérico para receitas altas
      updatedTransaction.categoryConfidence = 80
    }
    
    // Regra: Transferências entre contas
    const desc = normalizeText(transaction.description)
    if (desc.includes('transferencia') || desc.includes('ted') || desc.includes('pix')) {
      updatedTransaction.detectedCategory = 'Outros'
      updatedTransaction.categoryConfidence = 90
    }
    
    // Regra: Saques em dinheiro
    if (desc.includes('saque') || desc.includes('atm') || desc.includes('caixa eletronico')) {
      updatedTransaction.detectedCategory = 'Outros'
      updatedTransaction.categoryConfidence = 85
    }
    
    // Regra: Pagamentos de cartão
    if (desc.includes('cartao') || desc.includes('card') || desc.includes('credito') || desc.includes('debito')) {
      // Manter categoria original se já foi detectada com boa confiança
      if (!transaction.categoryConfidence || transaction.categoryConfidence < 50) {
        updatedTransaction.detectedCategory = 'Outros'
        updatedTransaction.categoryConfidence = 70
      }
    }
    
    return updatedTransaction
  })
} 