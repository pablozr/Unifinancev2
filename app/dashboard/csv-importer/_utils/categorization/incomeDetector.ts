import normalizeText from './textNormalizer'

/**
 * Detecta se uma transação é uma receita e não deve ser categorizada
 */
export default function isIncomeTransaction(description: string, type: string): boolean {
  // FILTRO PRINCIPAL: Não categorizar receitas/créditos automaticamente
  if (type === 'credit') {
    console.log(`💰 Pulando categorização de receita: "${description}" (tipo: ${type})`)
    return true
  }
  
  // FILTRO ADICIONAL: Detectar receitas por padrões na descrição
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
      console.log(`💰 Detectado padrão de receita: "${pattern}" em "${description}"`)
      return true
    }
  }
  
  return false
} 