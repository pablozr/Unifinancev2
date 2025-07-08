/**
 * @fileoverview Exportações centralizadas para componentes do dashboard
 * @description Ponto único de importação para todos os componentes do dashboard
 */

export { DashboardOverview } from './DashboardOverview'
export { CashFlowChart, CategoryPieChart } from './DashboardCharts'
export { DashboardNavigation } from './DashboardNavigation'
export { PeriodSelector } from './PeriodSelector'
export { default as AddTransactionModal } from './AddTransactionModal'
export { default as DeleteTransactionModal } from './DeleteTransactionModal'
export { TransactionsModal } from './TransactionsModal'
export { DataManagement } from './DataManagement'
export { ImportManager } from './ImportManager'
export { default as ManageRecurringModal } from './ManageRecurringModal'
export { RecurringVsVariableChart } from './RecurringVsVariableChart' 