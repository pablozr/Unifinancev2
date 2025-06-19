import normalizeText from './textNormalizer'

/**
 * Detecta se uma transaÃ§Ã£o Ã© uma receita e nÃ£o deve ser categorizada
 */
export default function isIncomeTransaction(description: string, type: string): boolean {
  if (type === 'credit') {
    return true
  }
  
  const desc = normalizeText(description)
  const receitaPatterns = [
    'salario', 'ordenado', 'vencimentos', 'folha',
    'deposito', 'credito em conta', 'transferencia recebida',
    'pix recebido', 'ted recebido', 'doc recebido',
    'rendimento', 'juros', 'dividendo', 'proventos',
    'reembolso', 'ressarcimento', 'devolucao',
    'freelance', 'consultoria', 'honorarios'
  ]
  
  for (const pattern of receitaPatterns) {
    if (desc.includes(pattern)) {
      return true
    }
  }
  
  return false
} 
