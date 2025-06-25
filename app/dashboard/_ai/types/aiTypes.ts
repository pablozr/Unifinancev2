export interface CategoryResult {
    category: string
    confidence: number
    reasoning: string
  }
  
  export interface AICategorizedTransaction {
    id?: string
    date: Date | string
    description: string
    amount: number
    type: string
    category?: string
    detectedCategory?: string
    categoryConfidence?: number
    categoryId?: string
    aiReasoning?: string
    aiUsed: boolean
    month?: number
    year?: number
  }
  
  export interface AIStats {
    totalTransactions: number
    aiProcessed: number
    averageConfidence: number
    processingTime: number
    failedTransactions: number
    apiProvider: string
  }