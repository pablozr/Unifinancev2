/**
 * @fileoverview Dashboard Data Module
 * @description Exporta todas as funções de dados do dashboard
 */

// === ESTATÍSTICAS DO DASHBOARD ===
export { revalidateStats } from './revalidateStats'

// === DADOS DE CATEGORIA ===
export { getCategoryData } from './getCategoryData'

// === FLUXO DE CAIXA ===
export { getCashFlowData } from './getCashFlowData'

// === COMPARAÇÕES MENSAIS ===
export { getMonthlyComparison } from './getMonthlyComparison'

// === FUNÇÕES PRINCIPAIS ===
export { default as getDashboardStats } from './getDashboardStats'
export { default as getFilteredDashboardStats } from './getFilteredDashboardStats'
export { default as getRecentTransactions } from './getRecentTransactions'
export { default as getAllTransactions } from './getAllTransactions'

// === FUNÇÕES DE TRANSAÇÃO ===
export { default as getTransactions } from './getTransactions'
export { default as getTransactionCount } from './getTransactionCount'

// === RE-EXPORT TYPES ===
export type { CategoryData } from './getCategoryData' 