'use client'

import { useState } from 'react'
import { deleteAllUserTransactions, clearAllImportRecords } from '../_actions/deleteTransactions'
import { formatCurrency } from '@/lib/utils/currency'

interface DataManagementProps {
  userId: string
}

interface DeleteResult {
  deleted: number
  totalImpact: number
  breakdown: {
    credits: number
    debits: number
    creditAmount: number
    debitAmount: number
  }
}

export function DataManagement({ userId }: DataManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'all' | 'month' | 'year'>('all')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [result, setResult] = useState<DeleteResult | null>(null)

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'MarÃ§o' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)



  const handleDelete = async () => {
    let confirmMessage = ''


    if (selectedOption === 'all') {
      confirmMessage = `ðŸš¨ ATENÃ‡ÃƒO EXTREMA! ðŸš¨

VocÃª estÃ¡ prestes a DELETAR TODAS AS TRANSAÃ‡Ã•ES e registros de import!

âš ï¸ ESTA AÃ‡ÃƒO NÃƒO PODE SER DESFEITA! âš ï¸

Digite "DELETAR TUDO" para confirmar:`

    } else if (selectedOption === 'month') {
      if (!selectedMonth) {
        alert('Selecione um mÃªs')
        return
      }
      const monthName = months.find(m => m.value === selectedMonth)?.label
      confirmMessage = `âš ï¸ ATENÃ‡ÃƒO! âš ï¸

VocÃª estÃ¡ prestes a DELETAR todas as transaÃ§Ãµes de ${monthName} ${selectedYear} e os registros de import relacionados.

Esta aÃ§Ã£o NÃƒO PODE ser desfeita!

Digite "DELETAR MES" para confirmar:`

    } else if (selectedOption === 'year') {
      confirmMessage = `âš ï¸ ATENÃ‡ÃƒO! âš ï¸

VocÃª estÃ¡ prestes a DELETAR todas as transaÃ§Ãµes de ${selectedYear} e os registros de import relacionados.

Esta aÃ§Ã£o NÃƒO PODE ser desfeita!

Digite "DELETAR ANO" para confirmar:`

    }

    const expectedText = selectedOption === 'all' ? 'DELETAR TUDO' : 
                        selectedOption === 'month' ? 'DELETAR MES' : 'DELETAR ANO'
    
    const confirmation = prompt(confirmMessage)
    
    if (confirmation !== expectedText) {
      alert('OperaÃ§Ã£o cancelada. Texto de confirmaÃ§Ã£o incorreto.')
      return
    }

    setIsLoading(true)
    try {
      let deleteResult: DeleteResult

      if (selectedOption === 'all') {
        deleteResult = await deleteAllUserTransactions(userId)
      } else {
        deleteResult = await deleteAllUserTransactions(userId)
      }

      await clearAllImportRecords(userId)

      setResult(deleteResult)
      
      alert(`âœ… SUCESSO! ${deleteResult.deleted} transaÃ§Ãµes foram deletadas. A pÃ¡gina serÃ¡ recarregada.`)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      // ... existing code ...
      alert(`âŒ Erro: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            ðŸ—‘ï¸ Gerenciamento de Dados
          </h3>
          <p className="text-gray-400 text-sm">
            Remova transaÃ§Ãµes e registros de import do sistema
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Seletor de Tipo de ExclusÃ£o */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Tipo de ExclusÃ£o
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedOption('all')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'all'
                  ? 'border-red-500 bg-red-500/10 text-red-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸš¨</div>
                <div className="font-medium">Deletar Tudo</div>
                <div className="text-xs opacity-75">Todas as transaÃ§Ãµes</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('month')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'month'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸ“…</div>
                <div className="font-medium">Deletar por MÃªs</div>
                <div className="text-xs opacity-75">PerÃ­odo especÃ­fico</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('year')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'year'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸ“†</div>
                <div className="font-medium">Deletar por Ano</div>
                <div className="text-xs opacity-75">Ano completo</div>
              </div>
            </button>
          </div>
        </div>

        {/* Seletores de PerÃ­odo */}
        {(selectedOption === 'month' || selectedOption === 'year') && (
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex gap-4">
              {selectedOption === 'month' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MÃªs
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Selecione o mÃªs</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ano
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* BotÃ£o de AÃ§Ã£o */}
        <div className="flex justify-center">
          <button
            onClick={handleDelete}
            disabled={isLoading || (selectedOption === 'month' && !selectedMonth)}
            className={`px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedOption === 'all'
                ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500'
                : selectedOption === 'month'
                ? 'bg-orange-600 hover:bg-orange-700 text-white border-2 border-orange-500'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deletando...
              </div>
            ) : (
              <>
                {selectedOption === 'all' && 'ðŸš¨ Deletar Todas as TransaÃ§Ãµes'}
                {selectedOption === 'month' && `ðŸ“… Deletar ${selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'MÃªs'} ${selectedYear}`}
                {selectedOption === 'year' && `ðŸ“† Deletar Ano ${selectedYear}`}
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <h4 className="text-green-300 font-medium mb-2">
              âœ… ExclusÃ£o ConcluÃ­da com Sucesso!
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-blue-400 font-bold">{result.deleted}</div>
                <div className="text-gray-400">Removidas</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">{result.breakdown.credits}</div>
                <div className="text-gray-400">Receitas</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold">{result.breakdown.debits}</div>
                <div className="text-gray-400">Despesas</div>
              </div>
              <div className="text-center">
                <div className={`font-bold ${result.totalImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(result.totalImpact)}
                </div>
                <div className="text-gray-400">Impacto</div>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">
              A pÃ¡gina serÃ¡ recarregada automaticamente...
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 
