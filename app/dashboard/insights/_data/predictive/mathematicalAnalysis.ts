export interface MonthlyDataPoint {
  month: string
  income: number
  expenses: number
  balance: number
  transactionCount: number
  date: Date
}

export interface LinearRegressionResult {
  slope: number
  intercept: number
  r2: number
}

export interface SeasonalityResult {
  factor: number
  confidence: number
  peak: number
  low: number
}

export interface CyclicalPattern {
  hasCycle: boolean
  cycleLength: number
  amplitude: number
}

export function linearRegression(points: { x: number; y: number }[]): LinearRegressionResult {
  if (points.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 }
  }

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0)
  const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calcular R²
  const meanY = sumY / n
  const totalSumSquares = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0)
  const residualSumSquares = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept
    return sum + Math.pow(p.y - predicted, 2)
  }, 0)

  const r2 = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares)

  return {
    slope: isFinite(slope) ? slope : 0,
    intercept: isFinite(intercept) ? intercept : 0,
    r2: isFinite(r2) ? Math.max(0, Math.min(1, r2)) : 0
  }
}

export function detectSeasonality(data: MonthlyDataPoint[]): SeasonalityResult {
  if (data.length < 6) {
    return { factor: 1, confidence: 0, peak: 0, low: 0 }
  }

  // Analisar padrão sazonal por mês do ano
  const monthlyAverages = new Map<number, number[]>()
  
  data.forEach(point => {
    const month = point.date.getMonth() + 1 // 1-12
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, [])
    }
    monthlyAverages.get(month)!.push(Math.abs(point.balance))
  })

  // Calcular médias por mês
  const averages: number[] = []
  for (let month = 1; month <= 12; month++) {
    const values = monthlyAverages.get(month) || []
    if (values.length > 0) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      averages.push(avg)
    }
  }

  if (averages.length < 3) {
    return { factor: 1, confidence: 0, peak: 0, low: 0 }
  }

  // Calcular variação sazonal
  const mean = averages.reduce((sum, val) => sum + val, 0) / averages.length
  const maxValue = Math.max(...averages)
  const minValue = Math.min(...averages)
  
  const seasonalVariation = mean > 0 ? (maxValue - minValue) / mean : 0
  const confidence = Math.min(100, seasonalVariation * 100)
  
  // Fator sazonal baseado no mês atual
  const currentMonth = new Date().getMonth() + 1
  const currentSeasonalValue = monthlyAverages.get(currentMonth)?.slice(-1)[0] || mean
  const factor = mean > 0 ? currentSeasonalValue / mean : 1

  return {
    factor: isFinite(factor) ? Math.max(0.5, Math.min(2, factor)) : 1,
    confidence: Math.round(confidence),
    peak: maxValue,
    low: minValue
  }
}

export function calculateVolatility(data: MonthlyDataPoint[]): number {
  if (data.length < 2) return 0

  const balances = data.map(d => d.balance)
  const mean = balances.reduce((sum, val) => sum + val, 0) / balances.length
  
  // Calcular desvio padrão
  const variance = balances.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / balances.length
  const stdDev = Math.sqrt(variance)
  
  // Normalizar pela média para obter volatilidade relativa
  const volatility = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0
  
  return Math.min(1, volatility) // Máximo 1 (100% de volatilidade)
}

export function detectCyclicalPatterns(data: MonthlyDataPoint[]): CyclicalPattern {
  if (data.length < 6) return { hasCycle: false, cycleLength: 0, amplitude: 0 }

  const balances = data.map(d => d.balance)
  
  // Detectar ciclos de 3, 4, 6 meses
  const cycleLengths = [3, 4, 6]
  let bestCycle = { length: 0, correlation: 0, amplitude: 0 }

  cycleLengths.forEach(cycleLength => {
    if (data.length < cycleLength * 2) return

    let correlation = 0
    let validComparisons = 0

    for (let i = 0; i < data.length - cycleLength; i++) {
      const current = balances[i]
      const cyclic = balances[i + cycleLength]
      
      if (current !== 0 && cyclic !== 0) {
        correlation += Math.abs(current - cyclic) / Math.max(Math.abs(current), Math.abs(cyclic))
        validComparisons++
      }
    }

    if (validComparisons > 0) {
      const avgCorrelation = 1 - (correlation / validComparisons) // Inverter para que alta correlação = valor alto
      const amplitude = Math.max(...balances) - Math.min(...balances)

      if (avgCorrelation > bestCycle.correlation) {
        bestCycle = { length: cycleLength, correlation: avgCorrelation, amplitude }
      }
    }
  })

  return {
    hasCycle: bestCycle.correlation > 0.7,
    cycleLength: bestCycle.length,
    amplitude: bestCycle.amplitude
  }
}

export function analyzeTrendsWithMovingAverage(monthlyData: MonthlyDataPoint[]) {
  if (monthlyData.length < 3) {
    return {
      trendDirection: 'stable' as const,
      trendStrength: 0,
      movingAverage: monthlyData[monthlyData.length - 1]?.balance || 0
    }
  }

  const windowSize = Math.min(3, monthlyData.length)
  const recentData = monthlyData.slice(-windowSize)
  
  const movingAverage = recentData.reduce((sum, data) => sum + data.balance, 0) / recentData.length
  
  // Comparar com média anterior
  const previousData = monthlyData.slice(-windowSize * 2, -windowSize)
  const previousAverage = previousData.length > 0 ? 
    previousData.reduce((sum, data) => sum + data.balance, 0) / previousData.length : 
    movingAverage

  const trendStrength = Math.abs(movingAverage - previousAverage) / Math.max(Math.abs(previousAverage), 100)
  
  let trendDirection: 'up' | 'down' | 'stable' = 'stable'
  if (movingAverage > previousAverage && trendStrength > 0.1) {
    trendDirection = 'up'
  } else if (movingAverage < previousAverage && trendStrength > 0.1) {
    trendDirection = 'down'
  }

  return {
    trendDirection,
    trendStrength: Math.min(1, trendStrength),
    movingAverage
  }
} 