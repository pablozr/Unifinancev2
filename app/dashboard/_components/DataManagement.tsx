'use client'

import { useState } from 'react'
import { deleteAllUserTransactions, clearAllImportRecords, type DeleteResult } from '../_actions/deleteTransactions'
import { formatCurrency } from '@/lib/utils/currency'
import { TrashIcon, AlertIcon, CalendarIcon } from '@/components/icons'
import ConfirmationModal, { useConfirmationModal } from '@/components/ui/ConfirmationModal'

interface DataManagementProps {
  userId: string
}

export function DataManagement({ userId }: DataManagementProps) {
  const [selectedOption, setSelectedOption] = useState<'all' | 'month' | 'year' | ''>('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DeleteResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const { modalId, openModal, closeModal } = useConfirmationModal()

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
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
    if (selectedOption === 'month' && !selectedMonth) {
      setErrorMessage('Selecione um mês')
      return
    }

    const modalIdMap = {
      'all': 'delete-all',
      'month': 'delete-month', 
      'year': 'delete-year'
    }

    openModal(modalIdMap[selectedOption as keyof typeof modalIdMap])
  }

  const handleConfirmDelete = async () => {
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
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setErrorMessage(`Erro: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Configurações dos modais de confirmação
  const getModalConfig = () => {
    const monthName = months.find(m => m.value === selectedMonth)?.label
    
    switch (modalId) {
      case 'delete-all':
        return {
          title: 'DELETAR TODAS AS TRANSAÇÕES',
          dangerLevel: 'extreme' as const,
          message: `🚨 ATENÇÃO EXTREMA! 🚨

Você está prestes a DELETAR TODAS AS TRANSAÇÕES e registros de import!

⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️`,
          confirmText: 'DELETAR TUDO',
          requireTextConfirmation: true,
          confirmationPhrase: 'DELETAR TUDO',
          onConfirm: handleConfirmDelete
        }
      
      case 'delete-month':
        return {
          title: 'Deletar Transações do Mês',
          dangerLevel: 'high' as const,
          message: `⚠️ ATENÇÃO! ⚠️

Você está prestes a DELETAR todas as transações de ${monthName} ${selectedYear} e os registros de import relacionados.

Esta ação NÃO PODE ser desfeita!`,
          confirmText: 'DELETAR MES',
          requireTextConfirmation: true,
          confirmationPhrase: 'DELETAR MES',
          onConfirm: handleConfirmDelete
        }
      
      case 'delete-year':
        return {
          title: 'Deletar Transações do Ano',
          dangerLevel: 'high' as const,
          message: `⚠️ ATENÇÃO! ⚠️

Você está prestes a DELETAR todas as transações de ${selectedYear} e os registros de import relacionados.

Esta ação NÃO PODE ser desfeita!`,
          confirmText: 'DELETAR ANO',
          requireTextConfirmation: true,
          confirmationPhrase: 'DELETAR ANO',
          onConfirm: handleConfirmDelete
        }
      
      default:
        return null
    }
  }

  const modalConfig = getModalConfig()

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <TrashIcon size={18} className="text-gray-400 sm:hidden" />
            <TrashIcon size={20} className="text-gray-400 hidden sm:block" />
            Gerenciamento de Dados
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            Remova transações e registros de import do sistema
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Seletor de Tipo de Exclusão */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 sm:mb-3">
            Tipo de Exclusão
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedOption('all')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'all'
                  ? 'border-red-500 bg-red-500/10 text-red-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="mb-2">
                  <AlertIcon size={24} className="text-red-400 mx-auto sm:hidden" />
                  <AlertIcon size={32} className="text-red-400 mx-auto hidden sm:block" />
                </div>
                <div className="font-medium text-sm sm:text-base">Deletar Tudo</div>
                <div className="text-xs opacity-75">Todas as transações</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('month')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'month'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="mb-2">
                  <CalendarIcon size={24} className="text-orange-400 mx-auto sm:hidden" />
                  <CalendarIcon size={32} className="text-orange-400 mx-auto hidden sm:block" />
                </div>
                <div className="font-medium text-sm sm:text-base">Deletar por Mês</div>
                <div className="text-xs opacity-75">Período específico</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('year')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                selectedOption === 'year'
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className="mb-2">
                  <CalendarIcon size={24} className="text-yellow-400 mx-auto sm:hidden" />
                  <CalendarIcon size={32} className="text-yellow-400 mx-auto hidden sm:block" />
                </div>
                <div className="font-medium text-sm sm:text-base">Deletar por Ano</div>
                <div className="text-xs opacity-75">Ano específico</div>
              </div>
            </button>
          </div>
        </div>

        {/* Seletores de Período Condicional */}
        {selectedOption === 'month' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione um mês</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selectedOption === 'year' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2 sm:p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            {errorMessage && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {errorMessage}
              </div>
            )}
                         {result && (
               <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                 ✅ {result.deleted} transações deletadas com sucesso!
               </div>
             )}
          </div>
          
          <button
            onClick={handleDelete}
            disabled={!selectedOption || isLoading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deletando...</span>
              </div>
            ) : (
              'Deletar Dados'
            )}
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {modalConfig && (
        <ConfirmationModal
          {...modalConfig}
          modalId={modalId}
        />
      )}
    </div>
  )
} 
