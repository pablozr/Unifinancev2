import React, { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ClientPeriodSelectorWrapper from './_components/ClientPeriodSelectorWrapper'
import FixedVariableChart from './_components/FixedVariableChart'
import RecurringTransactionsList from './_components/RecurringTransactionsList'
import { getExpenseBreakdown } from './_data/getExpenseBreakdown'
import type { PeriodFilter } from '@/app/dashboard/_data/types'

// Componente para carregar e exibir os dados
async function InsightsContent({
  userId,
  filter,
}: {
  userId: string
  filter: PeriodFilter
}) {
  const expenseData = await getExpenseBreakdown(userId, filter)

  return (
    <div className="space-y-6">
      {/* Card do Gráfico */}
      <div className="group bg-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6">
            Distribuição de Despesas
          </h2>
          <FixedVariableChart data={expenseData} />
        </div>
      </div>

      {/* Card da Lista de Transações Recorrentes */}
      <div className="group bg-black border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
        <div className="relative z-10">
          <RecurringTransactionsList
            transactions={expenseData.recurringTransactions}
          />
        </div>
      </div>
    </div>
  )
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="text-gray-400 text-center">Usuário não autenticado.</p>
  }

  // Await searchParams before using
  const params = await searchParams

  // A lógica de filtro agora é mais simples e direta
  const getFilter = (params: { period?: string; year?: string; month?: string }): PeriodFilter => {
    const period = params?.period as PeriodFilter['type'] | undefined
    const yearStr = params?.year
    const monthStr = params?.month

    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear()
    
    switch (period) {
      case 'monthly':
        const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth()
        return { type: 'monthly', year, month }
      case 'yearly':
        return { type: 'yearly', year }
      default:
        // Se nenhum período for especificado, o padrão é o ano atual.
        return { type: 'yearly', year: new Date().getFullYear() }
    }
  }

  const filter = getFilter(params)

  return (
    <div className="p-6 lg:p-8 bg-black min-h-screen">
      {/* Header com design preto puro */}
      <div className="mb-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              Análise Inteligente
            </h1>
            <p className="text-gray-400 text-lg">
              Descubra padrões e otimize suas finanças com análise de despesas recorrentes
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="lg:flex-shrink-0">
            <ClientPeriodSelectorWrapper />
          </div>
        </div>
        
        {/* Linha decorativa branca */}
        <div className="mt-6 h-px bg-gray-800"></div>
      </div>

      {/* Conteúdo principal */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="bg-black border border-gray-800 rounded-2xl p-6">
              <div className="flex h-60 w-full items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-800 border-t-white mx-auto mb-4"></div>
                  <p className="text-gray-400">Carregando análise...</p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <InsightsContent userId={user.id} filter={filter} />
      </Suspense>
    </div>
  )
}
