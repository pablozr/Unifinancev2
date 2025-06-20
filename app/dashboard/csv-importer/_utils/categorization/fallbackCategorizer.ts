import normalizeText from './textNormalizer'

export interface FallbackMatch {
  category: string
  confidence: number
  reason: string
}

/**
 * Categorização fallback baseada em padrões simples
 */
export default function fallbackCategorization(description: string): FallbackMatch | null {
  const desc = normalizeText(description)
  
  if (desc.includes('compra') || desc.includes('debito')) {
    if (desc.includes('posto') || desc.includes('gas') || desc.includes('combustivel')) {
      return {
        category: 'Transporte',
        confidence: 15,
        reason: 'PadrÃ£o de combustÃ­vel detectado'
      }
    } 
    
    if (desc.includes('farmacia') || desc.includes('drog')) {
      return {
        category: 'Saúde',
        confidence: 15,
        reason: 'Padrão de farmácia detectado'
      }
    } 
    
    if (desc.includes('mercado') || desc.includes('super')) {
      return {
        category: 'Alimentação',
        confidence: 15,
        reason: 'Padrão de supermercado detectado'
      }
    }
  }
  
  if (desc.includes('pix') || desc.includes('ted') || desc.includes('transf')) {
    return {
      category: 'Outros',
      confidence: 12,
      reason: 'Transferência detectada'
    }
  }
  
  if (desc.includes('pagamento') || desc.includes('conta')) {
    return {
      category: 'Casa',
      confidence: 10,
      reason: 'Pagamento de conta detectado'
    }
  }
  
  return null
} 
