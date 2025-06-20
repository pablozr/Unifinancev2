import normalizeText from './textNormalizer'

export interface PatternMatch {
  category: string
  confidence: number
  pattern: string
}

/**
 * Detecta padrões específicos de marcas conhecidas
 */
export default function detectSpecificPatterns(description: string): PatternMatch | null {
  const desc = normalizeText(description)
  
  if (desc.includes('ifood') || desc.includes('i food') || desc.includes('ifoods')) {
    return {
      category: 'Alimentação',
      confidence: 100,
      pattern: 'IFOOD'
    }
  }
  
  if (desc.includes('american pet') || desc.includes('americanpet')) {
    return {
      category: 'Casa',
      confidence: 90,
      pattern: 'AMERICAN PET'
    }
  }
  
  if (desc.includes('renner') || desc.includes('loja renner') || desc.includes('lojas renner')) {
    return {
      category: 'Vestuário',
      confidence: 90,
      pattern: 'RENNER'
    }
  }
  
  if (desc.includes('uber') && !desc.includes('uber eats')) {
    return {
      category: 'Transporte',
      confidence: 90,
      pattern: 'UBER'
    }
  }
  
  if (desc.includes('uber eats') || desc.includes('ubereats')) {
    return {
      category: 'Alimentação',
      confidence: 90,
      pattern: 'UBER EATS'
    }
  }
  
  if (desc.includes('netflix') || desc.includes('spotify')) {
    return {
      category: 'Lazer',
      confidence: 90,
      pattern: 'STREAMING'
    }
  }
  
  return null
} 
