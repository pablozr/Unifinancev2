import { average } from '../math'

/**
 * Calcula a confiança de um padrão baseado em intervalos e valores
 */
export const calculateConfidence = (intervals: number[], amounts: number[]): number => {
  if (intervals.length < 2) return 0
  
  const intervalConsistency = calculateIntervalConsistency(intervals)
  const amountConsistency = calculateAmountConsistency(amounts)
  const sampleConfidence = calculateSampleConfidence(amounts.length)
  
  // Combinar fatores com pesos
  return intervalConsistency * 0.4 + amountConsistency * 0.4 + sampleConfidence * 0.2
}

/**
 * Calcula consistência dos intervalos (0-1)
 */
const calculateIntervalConsistency = (intervals: number[]): number => {
  const avgInterval = average(intervals)
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length
  return Math.max(0, 1 - (Math.sqrt(variance) / avgInterval))
}

/**
 * Calcula consistência dos valores (0-1)
 */
const calculateAmountConsistency = (amounts: number[]): number => {
  const avgAmount = average(amounts)
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
  return Math.max(0, 1 - (Math.sqrt(variance) / Math.abs(avgAmount)))
}

/**
 * Calcula confiança baseada no tamanho da amostra (0-1)
 */
const calculateSampleConfidence = (sampleSize: number): number => {
  return Math.min(1, sampleSize / 6) // Máxima confiança com 6+ amostras
} 