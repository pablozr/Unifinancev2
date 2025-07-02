import { linearRegression, average, normalize } from '../math'

/**
 * Calcula a tendência de um padrão usando regressão linear
 */
export const calculateTrend = (amounts: number[], dates: Date[]): number => {
  if (amounts.length < 3) return 0
  
  const x = dates.map((_, i) => i) // Usar índices como x
  const { slope } = linearRegression(x, amounts)
  
  // Normalizar slope para -1 a 1
  const avgAmount = Math.abs(average(amounts))
  if (avgAmount === 0) return 0
  
  const normalizedSlope = slope / avgAmount
  return normalize(normalizedSlope, -1, 1)
} 