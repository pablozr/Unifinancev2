// Mapeamento inteligente por palavras-chave
const CATEGORY_PATTERNS = {
  'alimentação': ['ifood', 'uber eats', 'delivery', 'mercado', 'restaurante', 'padaria', 'açougue', 'supermercado', 'feira', 'lanchonete', 'pizza', 'hamburger'],
  'transporte': ['uber', '99', 'taxi', 'posto', 'combustivel', 'gasolina', 'etanol', 'metro', 'onibus', 'trem', 'brt', 'estacionamento'],
  'assinatura': ['netflix', 'spotify', 'amazon prime', 'youtube premium', 'disney+', 'globoplay', 'microsoft', 'adobe', 'canva'],
  'saúde': ['farmacia', 'medico', 'hospital', 'clinica', 'laboratorio', 'exame', 'consulta', 'dentista', 'oftalmologista'],
  'educação': ['escola', 'universidade', 'curso', 'livro', 'apostila', 'material escolar', 'mensalidade'],
  'casa': ['aluguel', 'condominio', 'luz', 'energia', 'agua', 'gas', 'internet', 'telefone', 'limpeza', 'mercado'],
  'lazer': ['cinema', 'teatro', 'show', 'festa', 'bar', 'balada', 'viagem', 'hotel', 'passagem'],
  'roupas': ['loja', 'shopping', 'roupa', 'sapato', 'bolsa', 'acessorio', 'perfume'],
  'receita': ['salario', 'freelance', 'vendas', 'comissao', 'bonus', 'dividendos', 'juros', 'rendimento']
}

export interface RecurringTransaction {
  description: string
  averageAmount: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
  intervalDays: number
  confidence: number
  category: string
  type: 'income' | 'expense'
  nextExpectedDate: Date
}

// Função para categorização inteligente
function smartCategorization(description: string, amount: number, existingCategory?: string): string {
  if (existingCategory && existingCategory !== 'Outros') {
    return existingCategory
  }

  const desc = description.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CATEGORY_PATTERNS)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        return category.charAt(0).toUpperCase() + category.slice(1)
      }
    }
  }

  // Categorização por valor (heurística)
  if (amount > 3000) return 'Salário/Receita'
  if (amount > 1000) return 'Grandes Despesas'
  if (amount < 50) return 'Pequenos Gastos'
  
  return 'Outros'
}

// Função para detectar transações recorrentes MELHORADA
export default function detectRecurringTransactions(transactions: any[]): RecurringTransaction[] {
  const recurring: RecurringTransaction[] = []
  
  // === ESTRATÉGIA 1: Agrupamento por valor exato ou muito próximo ===
  const groupedByValue = new Map<string, any[]>()
  
  transactions.forEach(t => {
    const amount = Math.abs(t.amount)
    const description = t.description.toLowerCase().trim()
    
    // Agrupar por faixas de valor mais flexíveis (±10% em vez de ±5%)
    const valueKey = Math.round(amount / 10) * 10 // Agrupa por faixas de R$ 10
    const key = `${valueKey}-${description.substring(0, 12)}` // Reduzir para 12 chars para mais matches
    
    if (!groupedByValue.has(key)) {
      groupedByValue.set(key, [])
    }
    groupedByValue.get(key)!.push(t)
  })
  
  // Analisar cada grupo (critérios mais relaxados)
  groupedByValue.forEach((group, key) => {
    if (group.length < 2) return // Apenas 2 ocorrências já é suficiente
    
    // Ordenar por data
    group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Calcular intervalos entre transações
    const intervals: number[] = []
    for (let i = 1; i < group.length; i++) {
      const current = new Date(group[i].date)
      const previous = new Date(group[i - 1].date)
      const diffDays = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
      intervals.push(diffDays)
    }
    
    if (intervals.length === 0) return
    
    // Calcular intervalo médio e desvio padrão
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
    const stdDev = Math.sqrt(variance)
    
    // Critérios mais relaxados para determinar recorrência
    const consistency = intervals.length === 1 ? 0 : stdDev / avgInterval
    if (consistency > 0.5) return // Aumentado de 0.3 para 0.5
    
    // Classificar frequência com faixas mais amplas
    let frequency: 'weekly' | 'monthly' | 'quarterly' | null = null
    
    if (avgInterval >= 5 && avgInterval <= 10) frequency = 'weekly'      // 5-10 dias
    else if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly'   // 25-35 dias
    else if (avgInterval >= 80 && avgInterval <= 100) frequency = 'quarterly' // 80-100 dias
    else if (avgInterval >= 11 && avgInterval <= 24) frequency = 'monthly'   // Quinzenal tratado como mensal
    else if (avgInterval >= 36 && avgInterval <= 79) frequency = 'monthly'   // Bimestrais tratados como mensais
    
    if (!frequency) return // Não se encaixa em nenhum padrão
    
    const firstTransaction = group[0]
    const averageAmount = group.reduce((sum, t) => sum + Math.abs(t.amount), 0) / group.length
    const category = smartCategorization(firstTransaction.description, averageAmount, firstTransaction.categories?.name)
    
    // Projetar próxima data esperada
    const lastDate = new Date(group[group.length - 1].date)
    const nextExpectedDate = new Date(lastDate.getTime() + avgInterval * 24 * 60 * 60 * 1000)
    
    // === CÁLCULO DE CONFIANÇA ULTRA REFINADO ===
    
    let confidence = 40 // Base mais conservadora
    
    // 1. Fator de quantidade (máximo 25%)
    const quantityFactor = Math.min(25, (group.length - 1) * 8)
    confidence += quantityFactor
    
    // 2. Fator de consistência temporal (máximo 30%)
    const consistencyFactor = Math.min(30, (1 - consistency) * 40)
    confidence += consistencyFactor
    
    // 3. Fator de regularidade da frequência (máximo 20%)
    let frequencyRegularityFactor = 0
    if (frequency === 'monthly' && avgInterval >= 28 && avgInterval <= 32) {
      frequencyRegularityFactor = 20 // Perfeita regularidade mensal
    } else if (frequency === 'weekly' && avgInterval >= 6 && avgInterval <= 8) {
      frequencyRegularityFactor = 18 // Perfeita regularidade semanal
    } else if (frequency === 'quarterly' && avgInterval >= 88 && avgInterval <= 92) {
      frequencyRegularityFactor = 15 // Perfeita regularidade trimestral
    } else {
      frequencyRegularityFactor = 10 // Regularidade aproximada
    }
    confidence += frequencyRegularityFactor
    
    // 4. Fator de valor consistente (máximo 15%)
    const amounts = group.map(t => Math.abs(t.amount))
    const amountVariance = amounts.reduce((sum, amt) => sum + Math.pow(amt - averageAmount, 2), 0) / amounts.length
    const amountConsistency = 1 - (Math.sqrt(amountVariance) / averageAmount)
    const valueConsistencyFactor = Math.min(15, amountConsistency * 15)
    confidence += valueConsistencyFactor
    
    // 5. Penalização por período muito antigo (máximo -10%)
    const daysSinceLastTransaction = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    let agePenalty = 0
    if (daysSinceLastTransaction > 60) {
      agePenalty = Math.min(10, (daysSinceLastTransaction - 60) / 10)
    }
    confidence -= agePenalty
    
    // 6. Bonus para transações recentes (máximo +10%)
    let recentBonus = 0
    if (daysSinceLastTransaction <= 7) {
      recentBonus = 10 // Muito recente
    } else if (daysSinceLastTransaction <= 30) {
      recentBonus = 5 // Razoavelmente recente
    }
    confidence += recentBonus
    
    // Garantir limites da confiança
    confidence = Math.max(30, Math.min(95, confidence))
    
    // Determinar tipo da transação
    const transactionType = firstTransaction.type === 'credit' ? 'income' : 'expense'
    
    recurring.push({
      description: firstTransaction.description,
      averageAmount,
      frequency,
      intervalDays: Math.round(avgInterval),
      confidence: Math.round(confidence),
      category,
      type: transactionType,
      nextExpectedDate
    })
  })
  
  // Ordenar por confiança descendente
  return recurring.sort((a, b) => b.confidence - a.confidence)
} 