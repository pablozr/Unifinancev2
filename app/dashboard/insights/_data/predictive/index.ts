﻿export { default as detectRecurringTransactions } from './recurringDetector'
export { default as projectCashFlow } from './cashFlowProjector'
export { default as generateAutomaticInsights } from './insightGenerator'

export {
  linearRegression,
  detectSeasonality,
  calculateVolatility,
  detectCyclicalPatterns,
  analyzeTrendsWithMovingAverage
} from './mathematicalAnalysis'

export type { RecurringTransaction } from './recurringDetector'
export type { CashFlowProjection } from './cashFlowProjector'
export type {
  MonthlyDataPoint,
  LinearRegressionResult,
  SeasonalityResult,
  CyclicalPattern
} from './mathematicalAnalysis' 
