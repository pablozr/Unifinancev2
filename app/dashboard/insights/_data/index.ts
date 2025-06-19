/**
 * @fileoverview ExportaÃ§Ãµes centralizadas para dados de insights
 * @description Ponto Ãºnico de importaÃ§Ã£o para todas as funÃ§Ãµes de dados de insights
 */

export { getCategoryInsights } from './getCategoryInsights'
export { getInsightMetrics } from './getInsightMetrics'

export { getPredictiveAnalysisRefactored as getPredictiveAnalysis } from './getPredictiveAnalysisRefactored'
export type { PredictiveAnalysis } from './getPredictiveAnalysisRefactored'

export { getFinancialScore } from './getFinancialScore'
export type { FinancialScore } from './getFinancialScore'

export { getSmartInsights, getSpendingPatterns } from './getSmartInsights'
export type { SmartInsight, SpendingPattern } from './getSmartInsights'

export { getCashFlowData } from '../../_data/getCashFlowData'

export type { InsightMetrics } from './getInsightMetrics'
export type { CategoryInsight } from './getCategoryInsights' 
