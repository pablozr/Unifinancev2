/**
 * @fileoverview Exportações centralizadas para dados de insights
 * @description Ponto único de importação para todas as funções de dados de insights
 */

// Funções existentes
export { getCategoryInsights } from './getCategoryInsights'
export { getInsightMetrics } from './getInsightMetrics'

// Novas funções avançadas
export { getPredictiveAnalysisRefactored as getPredictiveAnalysis } from './getPredictiveAnalysisRefactored'
export type { PredictiveAnalysis } from './getPredictiveAnalysisRefactored'

export { getFinancialScore } from './getFinancialScore'
export type { FinancialScore } from './getFinancialScore'

export { getSmartInsights, getSpendingPatterns } from './getSmartInsights'
export type { SmartInsight, SpendingPattern } from './getSmartInsights'

// Fluxo de caixa - usar da versão principal
export { getCashFlowData } from '../../_data/getCashFlowData'

// Re-export types
export type { InsightMetrics } from './getInsightMetrics'
export type { CategoryInsight } from './getCategoryInsights' 