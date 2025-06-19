export { default as validateFile } from './fileValidation'
export { default as checkDuplicates } from './duplicateHandler'
export { default as processCSV } from './csvProcessor'
export { default as processAutoCategorization } from './categorizationProcessor'
export { default as calculateCategoryStats } from './statsCalculator'

// Exportações do novo sistema de categorização refatorado
export { categorizeTransactions, applyAdvancedRules, mapCategoriesToIds } from './categorizationRefactored'

export type { FileValidationResult } from './fileValidation'
export type { DuplicateCheckResult } from './duplicateHandler'
export type { CSVProcessResult } from './csvProcessor'
export type { CategorizationResult } from './categorizationProcessor'
export type { StatsResult, CategoryStats } from './statsCalculator' 