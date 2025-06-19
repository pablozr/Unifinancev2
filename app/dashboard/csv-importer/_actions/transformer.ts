import { MonthlyData, ProcessedTransaction } from "../_types/types"
import { parseDateBR } from '@/lib/utils/validDate'

export function transformToMonthlyData(
    transactions: ProcessedTransaction[]
  ): MonthlyData[] {
    
    
    const grouped = transactions.reduce((acc, transaction) => {
      let date: Date
      
      if (transaction.date instanceof Date) {
        date = transaction.date
      } else if (typeof transaction.date === 'string') {
        const parsedDate = parseDateBR(transaction.date)
        if (!parsedDate) {
          return acc
        }
        date = parsedDate
      } else {
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
      
      const updatedTransaction = {
        ...transaction,
        month,
        year,
        date // Garantir que Ã© um objeto Date
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
      if (a.year !== b.year) {return b.year - a.year}
      return b.month - a.month
    })
    
    
    return result
}
