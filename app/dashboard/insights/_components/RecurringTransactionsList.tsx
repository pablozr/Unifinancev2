'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import type { ClassifiedTransaction } from '../_data/recurring/types'

interface RecurringTransactionsListProps {
  transactions: ClassifiedTransaction[]
}

export default function RecurringTransactionsList({ 
  transactions 
}: RecurringTransactionsListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Despesas Recorrentes Detectadas
        </h3>
        
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-300 text-lg font-medium mb-2">
            Nenhuma despesa recorrente detectada
          </p>
          <p className="text-gray-500 text-sm">
            O algoritmo não encontrou padrões recorrentes no período selecionado.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Tente selecionar um período maior ou aguarde mais dados históricos.
          </p>
        </div>
      </div>
    )
  }

  // Agrupa transações por descrição para exibição mais limpa
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const key = (transaction.description || '').toLowerCase().trim()
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(transaction)
    return acc
  }, {} as Record<string, ClassifiedTransaction[]>)

  // Ordena grupos por valor total (maior para menor)
  const sortedGroups = Object.entries(groupedTransactions).sort(
    ([, a], [, b]) => {
      const totalA = a.reduce((sum, t) => sum + t.amount, 0)
      const totalB = b.reduce((sum, t) => sum + t.amount, 0)
      return totalB - totalA
    }
  )

  const totalRecurringValue = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header preto puro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-semibold text-white">
            Despesas Recorrentes Detectadas
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {sortedGroups.length} tipo{sortedGroups.length !== 1 ? 's' : ''} de despesa{sortedGroups.length !== 1 ? 's' : ''} • {transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'}
          </p>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl px-4 py-2">
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {formatCurrency(totalRecurringValue)}
            </div>
            <div className="text-gray-400 text-xs">
              Total recorrente
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de grupos pretos */}
      <div className="space-y-3">
        {sortedGroups.map(([description, group], index) => {
          const totalAmount = group.reduce((sum, t) => sum + t.amount, 0)
          const avgAmount = totalAmount / group.length
          const sortedDates = group
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          
          // Calcula intervalo médio entre transações
          const intervals: number[] = []
          for (let i = 1; i < sortedDates.length; i++) {
            const diffDays = (new Date(sortedDates[i].date).getTime() - new Date(sortedDates[i-1].date).getTime()) / (1000 * 60 * 60 * 24)
            intervals.push(diffDays)
          }
          const avgInterval = intervals.length > 0 
            ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length 
            : 0
          
          const getFrequencyText = (days: number) => {
            if (days <= 9) return '~Semanal'
            if (days <= 16) return '~Quinzenal' 
            if (days <= 35) return '~Mensal'
            if (days <= 70) return '~Bimestral'
            return `~${Math.round(days)} dias`
          }
          
          return (
            <div 
              key={description}
              className="bg-black border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">
                        {index === 0 ? '🔄' : index === 1 ? '📱' : index === 2 ? '🏠' : '💳'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">
                        {group[0].description || 'Sem descrição'}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-gray-400 text-sm">
                          {group.length} ocorrência{group.length > 1 ? 's' : ''}
                        </span>
                        {avgInterval > 0 && (
                          <span className="text-gray-500 text-xs bg-gray-800 border border-gray-600 px-2 py-1 rounded-full">
                            {getFrequencyText(avgInterval)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(totalAmount)}
                  </div>
                  {group.length > 1 && (
                    <div className="text-gray-400 text-sm">
                      {formatCurrency(avgAmount)}/vez
                    </div>
                  )}
                </div>
              </div>
              
              {/* Timeline preta */}
              {group.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-500 text-xs mb-3">Histórico:</p>
                  <div className="flex flex-wrap gap-2">
                    {sortedDates.slice(0, 6).map((transaction, idx) => (
                      <div 
                        key={transaction.id}
                        className="inline-flex items-center bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-xs"
                      >
                        <span className="text-gray-300 font-medium">
                          {new Date(transaction.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    ))}
                    {group.length > 6 && (
                      <div className="inline-flex items-center text-gray-500 text-xs">
                        +{group.length - 6} mais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 