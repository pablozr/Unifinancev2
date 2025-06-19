'use client'

import { UploadResult } from '../_actions/uploadAndProcess'
import { MonthlyData } from '../_types/types'
import { formatCurrency } from '@/lib/utils/currency'

interface ResultsViewProps {
  result: UploadResult
  onNewUpload: () => void
}

export default function ResultsView({ result, onNewUpload }: ResultsViewProps) {
  if (!result.success || !result.data) {
    return null
  }

  const { totalRows, validRows, monthlyData, categorizedTransactions, categoryStats } = result.data

  const formatMonth = (month: number, year: number) => {
    const date = new Date(year, month - 1)
    return new Intl.DateTimeFormat('pt-BR', { 
      month: 'long', 
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    }).format(date)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header de Sucesso */}
      <div className={`${result.isUpdate ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'} rounded-3xl p-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-12 h-12 ${result.isUpdate ? 'bg-blue-500/20' : 'bg-green-500/20'} rounded-2xl flex items-center justify-center`}>
            {result.isUpdate ? (
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-xl font-medium text-white">
              {result.isUpdate ? 'Arquivo atualizado com sucesso!' : 'Arquivo processado com sucesso!'}
            </h2>
            <p className={`${result.isUpdate ? 'text-blue-400/80' : 'text-green-400/80'} text-sm`}>
              {result.isUpdate ? 'Dados anteriores foram substituídos • ' : ''}
              {validRows} de {totalRows} transações foram {result.isUpdate ? 'atualizadas' : 'importadas'}
            </p>
          </div>
        </div>
        
        {result.isUpdate && (
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-400/90 text-sm">
                Arquivo duplicado detectado. Os dados anteriores foram removidos e substituídos pelos novos.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl font-light text-white mb-1">
              {totalRows}
            </div>
            <div className="text-white/60 text-sm">
              Total de Linhas
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl font-light text-green-400 mb-1">
              {validRows}
            </div>
            <div className="text-white/60 text-sm">
              Transações Válidas
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl font-light text-blue-400 mb-1">
              {monthlyData.length}
            </div>
            <div className="text-white/60 text-sm">
              Meses Processados
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl font-light text-purple-400 mb-1">
              {categorizedTransactions || 0}
            </div>
            <div className="text-white/60 text-sm">
              Categorizadas Automaticamente
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas de Categorização */}
      {categoryStats && Object.keys(categoryStats).length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              🤖 Categorização Automática
            </h3>
            <div className="text-white/60 text-sm">
              {(() => {
                const expenses = monthlyData.flatMap(m => m.transactions).filter(t => t.type === 'debit')
                return expenses.length > 0 ? Math.round((categorizedTransactions! / expenses.length) * 100) : 0
              })()}% das despesas categorizadas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([category, stats]) => (
                <div key={category} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white text-sm">{category}</h4>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400/60 rounded-full"></div>
                      <span className="text-white/60 text-xs">{stats.count}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/60">Confiança média</span>
                      <span className={`font-medium ${
                        stats.avgConfidence >= 70 ? 'text-green-400' :
                        stats.avgConfidence >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {stats.avgConfidence}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-white/[0.05] rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          stats.avgConfidence >= 70 ? 'bg-green-400/60' :
                          stats.avgConfidence >= 50 ? 'bg-yellow-400/60' : 'bg-red-400/60'
                        }`}
                        style={{ width: `${stats.avgConfidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-purple-400/90 text-sm">
                As transações foram categorizadas automaticamente baseadas na descrição. Revise abaixo se alguma categoria está incorreta.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes das Transações Categorizadas */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">
            📋 Revisão das Categorizações
          </h3>
          <div className="text-white/60 text-sm">
            Clique para expandir cada mês
          </div>
        </div>

        <div className="space-y-4">
          {monthlyData.map((month: MonthlyData, index: number) => (
            <details key={`${month.year}-${month.month}`} className="group">
              <summary className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 cursor-pointer hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white capitalize flex items-center gap-2">
                    📅 {formatMonth(month.month, month.year)}
                    <span className="text-white/60 text-sm">({month.transactions.length} transações)</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/60">
                      Saldo: {formatCurrency(month.netBalance)}
                    </span>
                    <svg className="w-4 h-4 text-white/60 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </summary>

              <div className="mt-4 space-y-2 pl-4">
                {month.transactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction, txIndex) => (
                    <div key={txIndex} className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${
                              transaction.type === 'credit' ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            <span className="font-medium text-white text-sm truncate">
                              {transaction.description}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <span>
                              {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span>
                              {transaction.type === 'credit' ? 'Receita' : 'Despesa'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-medium text-sm ${
                            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(transaction.amount)}
                          </div>
                          
                          {transaction.detectedCategory && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                (transaction.categoryConfidence ?? 0) >= 70 ? 'bg-green-500/20 text-green-400' :
                                (transaction.categoryConfidence ?? 0) >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {transaction.detectedCategory}
                              </span>
                              <span className="text-xs text-white/40">
                                {transaction.categoryConfidence ?? 0}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Como interpretar as cores:</h4>
              <div className="text-sm text-blue-400/80 space-y-1">
                <div>🟢 <span className="text-green-400">Verde (70%+)</span>: Categorização com alta confiança</div>
                <div>🟡 <span className="text-yellow-400">Amarelo (50-69%)</span>: Categorização com confiança média - revisar</div>
                <div>🔴 <span className="text-red-400">Vermelho (&lt;50%)</span>: Categorização com baixa confiança - verificar</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Mensal */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">
            Resumo Mensal
          </h3>
          <button
            onClick={onNewUpload}
            className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white px-4 py-2 rounded-xl text-sm transition-all duration-300"
          >
            Novo Upload
          </button>
        </div>

        <div className="space-y-4">
          {monthlyData.map((month: MonthlyData, index: number) => (
            <div
              key={`${month.year}-${month.month}`}
              className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white capitalize">
                  {formatMonth(month.month, month.year)}
                </h4>
                <div className="text-sm text-white/60">
                  {month.transactions.length} transações
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-green-400 font-medium">
                    {formatCurrency(month.totalIncome)}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Receitas
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-red-400 font-medium">
                    {formatCurrency(month.totalExpenses)}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Despesas
                  </div>
                </div>

                <div className="text-center">
                  <div className={`font-medium ${
                    month.netBalance >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(month.netBalance)}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    Saldo Líquido
                  </div>
                </div>
              </div>

              {/* Barra de progresso visual */}
              <div className="mt-4">
                <div className="flex h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="bg-green-400/60"
                    style={{
                      width: `${(month.totalIncome / (month.totalIncome + month.totalExpenses)) * 100}%`
                    }}
                  />
                  <div
                    className="bg-red-400/60"
                    style={{
                      width: `${(month.totalExpenses / (month.totalIncome + month.totalExpenses)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="text-center">
        <button
          onClick={onNewUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300"
        >
          Importar Outro Arquivo
        </button>
      </div>
    </div>
  )
} 