import { RecurringPattern, ProjectionPoint, DailyImpact } from '../../_types/projection'
import { getToday, addDays, formatDateISO } from '../dates'
import { normalize } from '../math'
import { 
  PROJECTION_DAYS, 
  RELIABLE_CONFIDENCE_THRESHOLD, 
  MIN_TRANSACTIONS_FOR_PATTERN,
  MAX_PATTERNS_TO_CONSIDER,
  CONSERVATIVE_DISCOUNT,
  MAX_VARIATION_PERCENTAGE,
  MAX_DAILY_CHANGE,
  MIN_PROBABILITY_THRESHOLD,
  CONFIDENCE_DECAY_RATE,
  MIN_CONFIDENCE
} from '../constants'

/**
 * Gera projeção de fluxo de caixa baseada em padrões recorrentes
 */
export const generateProjection = (
  initialBalance: number,
  patterns: RecurringPattern[]
): ProjectionPoint[] => {
  const today = getToday()
  const reliablePatterns = filterReliablePatterns(patterns)
  
  return buildProjectionPoints(today, initialBalance, reliablePatterns)
}

/**
 * Filtra padrões confiáveis e limita quantidade
 */
const filterReliablePatterns = (patterns: RecurringPattern[]): RecurringPattern[] => {
  return patterns
    .filter(p => p.confidence > RELIABLE_CONFIDENCE_THRESHOLD && 
                 p.transactionCount >= MIN_TRANSACTIONS_FOR_PATTERN)
    .slice(0, MAX_PATTERNS_TO_CONSIDER)
}

/**
 * Constrói pontos da projeção dia a dia
 */
const buildProjectionPoints = (
  startDate: Date,
  initialBalance: number,
  patterns: RecurringPattern[]
): ProjectionPoint[] => {
  const projection: ProjectionPoint[] = []
  
  // Ponto inicial
  projection.push(createInitialPoint(startDate, initialBalance))
  
  let currentBalance = initialBalance
  let currentPessimistic = initialBalance
  let currentOptimistic = initialBalance
  
  // Gerar projeção dia a dia
  for (let day = 1; day <= PROJECTION_DAYS; day++) {
    const projectionDate = addDays(startDate, day)
    const dailyImpact = calculateDailyImpact(patterns, day)
    const confidence = calculateTimeDecayConfidence(day)
    
    currentBalance += dailyImpact.base
    currentPessimistic += dailyImpact.pessimistic
    currentOptimistic += dailyImpact.optimistic
    
    projection.push({
      date: formatDateISO(projectionDate),
      balance: currentBalance,
      pessimistic: currentPessimistic,
      optimistic: currentOptimistic,
      confidence
    })
  }
  
  return projection
}

/**
 * Cria ponto inicial da projeção
 */
const createInitialPoint = (date: Date, balance: number): ProjectionPoint => ({
  date: formatDateISO(date),
  balance,
  pessimistic: balance,
  optimistic: balance,
  confidence: 1.0
})

/**
 * Calcula impacto diário conservador
 */
const calculateDailyImpact = (patterns: RecurringPattern[], dayOffset: number): DailyImpact => {
  let totalBase = 0
  let totalPessimistic = 0
  let totalOptimistic = 0
  
  for (const pattern of patterns) {
    const probability = calculatePatternProbability(pattern, dayOffset)
    
    if (probability > MIN_PROBABILITY_THRESHOLD) {
      const dailyBase = (pattern.avgAmount / pattern.avgInterval) * probability * CONSERVATIVE_DISCOUNT
      const variation = Math.abs(dailyBase) * Math.min(pattern.variability, MAX_VARIATION_PERCENTAGE)
      
      totalBase += dailyBase
      totalPessimistic += dailyBase - variation
      totalOptimistic += dailyBase + variation
    }
  }
  
  return {
    base: normalize(totalBase, -MAX_DAILY_CHANGE, MAX_DAILY_CHANGE),
    pessimistic: normalize(totalPessimistic, -MAX_DAILY_CHANGE * 1.5, MAX_DAILY_CHANGE * 0.5),
    optimistic: normalize(totalOptimistic, -MAX_DAILY_CHANGE * 0.5, MAX_DAILY_CHANGE * 1.5)
  }
}

/**
 * Calcula probabilidade simples de ocorrência do padrão
 */
const calculatePatternProbability = (pattern: RecurringPattern, dayOffset: number): number => {
  const expectedDayForNext = pattern.avgInterval
  
  if (dayOffset >= expectedDayForNext) {
    return Math.min(1.0, pattern.confidence)
  }
  
  const ratio = dayOffset / expectedDayForNext
  return ratio * pattern.confidence * 0.5
}

/**
 * Calcula degradação de confiança ao longo do tempo
 */
const calculateTimeDecayConfidence = (day: number): number => {
  const timeDecay = Math.exp(-day / CONFIDENCE_DECAY_RATE)
  return Math.max(MIN_CONFIDENCE, timeDecay)
} 