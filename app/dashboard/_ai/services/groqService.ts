import Groq from 'groq-sdk'
import { CategoryResult } from '../types/aiTypes'

class GroqService {
    private groq: Groq
    private readonly maxRetries = 2
    private readonly timeout = 10000

    constructor() {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set')
        }
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        })
    }

    async categorizeBatch(
        transactions: Array<{description: string, amount: number, type: string}>,
        availableCategories: string[],
    ): Promise<Array<CategoryResult | null>> {
        if (transactions.length === 0) return []
        console.log(`🤖 Groq: processando ${transactions.length} transações...`)
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const prompt = this.buildPrompt(transactions, availableCategories)
        const response = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                     content: "Você é um especialista em categorização de transações bancárias brasileiras. Sempre responda APENAS com JSON válido, sem texto extra."
                },
                {
                    role: "user", 
                    content: prompt
                  }
            ],
            model: "Compound-Beta",
            temperature: 0.2,
            max_tokens: 4096,
            top_p: 0.9,
        })

        const content = response.choices[0]?.message?.content
        const result = this.parseResponse(content, transactions.length)

        console.log(`✅ Groq: sucesso na tentativa ${attempt}`)
        return result
        
      } catch (error) {
        console.error(`❌ Groq tentativa ${attempt} falhou:`, error)
        
        if (attempt === this.maxRetries) {
          console.error('🚨 Groq: todas as tentativas falharam')
          return this.getFallbackResults(transactions.length)
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    
    return this.getFallbackResults(transactions.length)
  }

  private buildPrompt(
    transactions: Array<{description: string, amount: number, type: string}>,
    categories: string[]
  ): string {
    const transactionsList = transactions.map((t, index) => {
      const valor = Math.abs(t.amount).toFixed(2)
      const tipo = t.type === 'credit' ? 'Receita' : 'Despesa'
      return `${index + 1}. "${t.description}" | R$ ${valor} | ${tipo}`
    }).join('\n')

    return `Categorize estas ${transactions.length} transações bancárias brasileiras:

TRANSAÇÕES:
${transactionsList}

CATEGORIAS DISPONÍVEIS:
${categories.join(', ')}

REGRAS ESPECÍFICAS:
- RIOPAR ou qualquer variação = SEMPRE "Transporte" (100% confiança)
- iFood, Uber Eats = "Alimentação"
- Uber (sem "Eats") = "Transporte"
- PIX, TED sem identificação clara = "Outros"
- Farmácia, Drogaria = "Saúde"

REGRAS GERAIS:
- Use APENAS as categorias listadas acima
- Se não souber com certeza, use "Outros"
- Confidence: número de 0 a 100 (100 = certeza absoluta)
- Seja consistente e preciso

RESPONDA APENAS O JSON ARRAY (sem texto extra):
[
  {"category": "Alimentação", "confidence": 95, "reasoning": "iFood indica delivery de comida"},
  {"category": "Transporte", "confidence": 100, "reasoning": "RIOPAR é empresa de transporte"}
]`
  }

  private parseResponse(content: string | null, expectedLength: number): Array<CategoryResult> {
    if (!content) {
      console.error('🚨 Groq: resposta vazia')
      return this.getFallbackResults(expectedLength)
    }

    try {
      // Limpar a resposta
      let cleanContent = content.trim()
      
      // Tentar extrair JSON array
      const jsonMatch = cleanContent.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        cleanContent = jsonMatch[0]
      }
      
      const parsed = JSON.parse(cleanContent)
      
      if (!Array.isArray(parsed)) {
        throw new Error('Resposta não é um array')
      }
      
      if (parsed.length !== expectedLength) {
        console.warn(`⚠️ Groq: esperado ${expectedLength}, recebido ${parsed.length}`)
        
        // Se recebeu menos, completar com fallback
        while (parsed.length < expectedLength) {
          parsed.push({
            category: 'Outros',
            confidence: 10,
            reasoning: 'Transação adicional não processada'
          })
        }
        
        // Se recebeu mais, cortar
        if (parsed.length > expectedLength) {
          parsed.splice(expectedLength)
        }
      }
      
      return parsed.map((item, index) => ({
        category: item.category || 'Outros',
        confidence: Math.min(100, Math.max(0, parseInt(item.confidence) || 0)),
        reasoning: item.reasoning || `Categorização automática ${index + 1}`
      }))
      
    } catch (error) {
      console.error('🚨 Groq parse error:', error)
      console.error('🚨 Conteúdo recebido:', content)
      return this.getFallbackResults(expectedLength)
    }
  }

  private getFallbackResults(length: number): Array<CategoryResult> {
    return Array(length).fill(null).map((_, index) => ({
      category: 'Outros',
      confidence: 15,
      reasoning: `Erro na API - fallback ${index + 1}`
    }))
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: "user", content: "test" }],
        model: "llama-3.1-8b-instant",
        max_tokens: 1
      })
      
      return !!response.choices[0]
    } catch (error) {
      console.error('🚨 Groq não disponível:', error)
      return false
    }
  }
}

export default new GroqService()