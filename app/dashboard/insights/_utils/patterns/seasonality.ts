import { average } from '../math'
import { WEEKLY_INTERVAL, MONTHLY_INTERVAL, QUARTERLY_INTERVAL, SEASONALITY_TOLERANCE } from '../constants'

export type SeasonalityType = 'weekly' | 'monthly' | 'quarterly' | 'none'

/**
 * Detecta padrão de sazonalidade baseado nos intervalos
 */
export const detectSeasonality = (intervals: number[]): SeasonalityType => {
  if (intervals.length < 2) return 'none'
  
  const avgInterval = average(intervals)
  
  if (isWithinTolerance(avgInterval, WEEKLY_INTERVAL)) return 'weekly'
  if (isWithinTolerance(avgInterval, MONTHLY_INTERVAL)) return 'monthly'
  if (isWithinTolerance(avgInterval, QUARTERLY_INTERVAL)) return 'quarterly'
  
  return 'none'
}

/**
 * Verifica se um valor está dentro da tolerância de um alvo
 */
const isWithinTolerance = (value: number, target: number): boolean => {
  return Math.abs(value - target) <= target * SEASONALITY_TOLERANCE
} 