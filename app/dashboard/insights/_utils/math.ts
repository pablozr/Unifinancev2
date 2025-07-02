/**
 * Calcula a média de um array de números
 */
export const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}

/**
 * Calcula a variância de um array de números
 */
export const variance = (numbers: number[]): number => {
  if (numbers.length < 2) return 0
  const avg = average(numbers)
  return numbers.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / numbers.length
}

/**
 * Calcula o desvio padrão
 */
export const standardDeviation = (numbers: number[]): number => {
  return Math.sqrt(variance(numbers))
}

/**
 * Calcula coeficiente de variação normalizado (0-1)
 */
export const variationCoefficient = (numbers: number[]): number => {
  if (numbers.length < 2) return 0
  const avg = average(numbers)
  if (Math.abs(avg) === 0) return 0
  return Math.min(1, standardDeviation(numbers) / Math.abs(avg))
}

/**
 * Calcula regressão linear simples
 */
export const linearRegression = (x: number[], y: number[]): { slope: number, intercept: number } => {
  if (x.length !== y.length || x.length < 2) {
    return { slope: 0, intercept: 0 }
  }
  
  const n = x.length
  const sumX = x.reduce((sum, xi) => sum + xi, 0)
  const sumY = y.reduce((sum, yi) => sum + yi, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return { slope, intercept }
}

/**
 * Normaliza um valor para um range específico
 */
export const normalize = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

/**
 * Calcula diferença em dias entre duas datas
 */
export const daysDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
} 