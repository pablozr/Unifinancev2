import { MonthlyData, ProcessedTransaction } from "../_types/types"
import { parseDateBR } from '@/lib/utils/validDate'

export function transformToMonthlyData(
    transactions: ProcessedTransaction[]
  ): MonthlyData[] {
    
    console.log('Transformando transações:', transactions.slice(0, 3))
    
    const grouped = transactions.reduce((acc, transaction) => {
      // Garantir que temos uma data válida
      let date: Date
      
      if (transaction.date instanceof Date) {
        date = transaction.date
      } else if (typeof transaction.date === 'string') {
        // Processar string de data usando função unificada
        const parsedDate = parseDateBR(transaction.date)
        if (!parsedDate) {
          console.warn('Data inválida encontrada:', transaction.date)
          return acc
        }
        date = parsedDate
      } else {
        console.warn('Data inválida encontrada:', transaction.date)
        return acc
      }
      
      const month = date.getMonth() + 1 // 1-12
      const year = date.getFullYear()
      const key = `${year}-${month.toString().padStart(2, '0')}`
      
      if (!acc[key]) {
        acc[key] = {
          month,
          year,
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
          transactions: []
        }
      }
      
      // Atualizar transação com mês/ano corretos
      const updatedTransaction = {
        ...transaction,
        month,
        year,
        date // Garantir que é um objeto Date
      }
      
      acc[key].transactions.push(updatedTransaction)
      
      if (transaction.type === 'credit') {
        acc[key].totalIncome += transaction.amount
      } else {
        acc[key].totalExpenses += transaction.amount
      }
      
      acc[key].netBalance = acc[key].totalIncome - acc[key].totalExpenses
      
      return acc
    }, {} as Record<string, MonthlyData>)
    
    const result = Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
    
    console.log('Dados mensais agrupados:', result)
    
    return result
}