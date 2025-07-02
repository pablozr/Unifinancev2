// Configurações de projeção
export const PROJECTION_DAYS = 30
export const ANALYSIS_PERIOD_DAYS = 90
export const RECENT_PERIOD_DAYS = 30

// Filtros de qualidade
export const MIN_TRANSACTIONS_FOR_PATTERN = 3
export const MIN_CONFIDENCE_THRESHOLD = 0.3
export const RELIABLE_CONFIDENCE_THRESHOLD = 0.5
export const MAX_PATTERNS_TO_CONSIDER = 8

// Limites conservadores
export const CONSERVATIVE_DISCOUNT = 0.5
export const MAX_VARIATION_PERCENTAGE = 0.2
export const MAX_DAILY_CHANGE = 200
export const MIN_PROBABILITY_THRESHOLD = 0.05

// Estimativa de saldo inicial
export const SAVINGS_RATIO_HIGH = 1.2
export const SAVINGS_RATIO_BALANCED = 0.8
export const BALANCE_ESTIMATE_HIGH = 0.3
export const BALANCE_ESTIMATE_BALANCED = 0.1
export const BALANCE_ESTIMATE_SAFETY = 0.5

// Confiança temporal
export const CONFIDENCE_DECAY_RATE = 20
export const MIN_CONFIDENCE = 0.2

// Sazonalidade
export const WEEKLY_INTERVAL = 7
export const MONTHLY_INTERVAL = 30
export const QUARTERLY_INTERVAL = 90
export const SEASONALITY_TOLERANCE = 0.2 