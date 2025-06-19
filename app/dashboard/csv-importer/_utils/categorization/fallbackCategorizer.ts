import normalizeText from './textNormalizer'

export interface FallbackMatch {
  category: string
  confidence: number
  reason: string
}

/**
 * CategorizaÃ§Ã£o fallback baseada em padrÃµes simples
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
        category: 'SaÃºde',
        confidence: 15,
        reason: 'PadrÃ£o de farmÃ¡cia detectado'
      }
    } 
    
    if (desc.includes('mercado') || desc.includes('super')) {
      return {
        category: 'AlimentaÃ§Ã£o',
        confidence: 15,
        reason: 'PadrÃ£o de supermercado detectado'
      }
    }
  }
  
  if (desc.includes('pix') || desc.includes('ted') || desc.includes('transf')) {
    return {
      category: 'Outros',
      confidence: 12,
      reason: 'TransferÃªncia detectada'
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
