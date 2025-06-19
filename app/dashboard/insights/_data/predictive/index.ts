// Exportar funcionalidades principais
export { default as detectRecurringTransactions } from './recurringDetector'
export { default as projectCashFlow } from './cashFlowProjector'
export { default as generateAutomaticInsights } from './insightGenerator'

// Exportar análises matemáticas
export {
  linearRegression,
  detectSeasonality,
  calculateVolatility,
  detectCyclicalPatterns,
  analyzeTrendsWithMovingAverage
} from './mathematicalAnalysis'

// Exportar tipos
export type { RecurringTransaction } from './recurringDetector'
export type { CashFlowProjection } from './cashFlowProjector'
export type {
  MonthlyDataPoint,
  LinearRegressionResult,
  SeasonalityResult,
  CyclicalPattern
} from './mathematicalAnalysis' 