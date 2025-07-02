export const MIN_TRANSACTIONS_FOR_RECURRENCE = 2
export const VALUE_TOLERANCE_PERCENTAGE = 0.15 // 15% de tolerância no valor
export const FREQUENCY_PATTERNS = [
  { name: 'weekly', days: 7, tolerance: 2 },
  { name: 'biweekly', days: 14, tolerance: 3 },
  { name: 'monthly', days: 30, tolerance: 5 },
  { name: 'bimonthly', days: 60, tolerance: 7 },
] 