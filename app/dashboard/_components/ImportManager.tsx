'use client'

import { useState } from 'react'
import { deleteAllImportedTransactions, previewDeletionByPeriod, clearAllImportRecords, type DeleteResult } from '../_actions/deleteTransactions'
import { formatCurrency } from '@/lib/utils/currency'
import ConfirmationModal, { useConfirmationModal } from '@/components/ui/ConfirmationModal'

interface ImportManagerProps {
  userId: string
}

export function ImportManager({ userId }: ImportManagerProps) {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<{ count: number; totalAmount: number } | null>(null)
  const [result, setResult] = useState<DeleteResult | null>(null)
  const [clearImportsResult, setClearImportsResult] = useState<{ success: boolean; message: string } | null>(null)
  
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
    { value: '12', label: 'Dezembro' },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i)

  const handlePreview = async () => {
    if (!selectedMonth) {
      setClearImportsResult({
        success: false,
        message: 'Selecione um mês'
      })
      return
    }

    setIsLoading(true)
    try {
      const startDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1)
      const endDate = new Date(selectedYear, parseInt(selectedMonth), 0, 23, 59, 59)

      const previewResult = await previewDeletionByPeriod(userId, startDate, endDate)

      setPreview(previewResult)
    } catch (error) {
      setClearImportsResult({
        success: false,
        message: 'Erro ao visualizar transações'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePeriod = async () => {
    if (!preview || preview.count === 0) {
      return
    }

    setIsLoading(true)
    try {
      const startDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1)
      const endDate = new Date(selectedYear, parseInt(selectedMonth), 0, 23, 59, 59)

      const deleteResult = await deleteAllImportedTransactions(userId, startDate, endDate)
      setResult(deleteResult)
      setPreview(null)
      
      setTimeout(() => {
        window.location.reload()
      }, 3000)
    } catch (error) {
      setClearImportsResult({
        success: false,
        message: 'Erro ao excluir transações'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearImports = async () => {
    setIsLoading(true)
    try {
      const result = await clearAllImportRecords(userId)
      setClearImportsResult(result)
    } catch (error) {
      setClearImportsResult({
        success: false,
        message: `Erro na limpeza de imports: ${error}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    setIsLoading(true)
    try {
      const result = await deleteAllImportedTransactions(userId, new Date(), new Date())
      setResult(result)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Erro ao excluir transações:', error)
      setClearImportsResult({
        success: false,
        message: `Erro ao excluir transações: ${error}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Configurações dos modais de confirmação
  const getModalConfig = () => {
    const monthName = months.find(m => m.value === selectedMonth)?.label
    
    switch (modalId) {
      case 'clear-imports':
        return {
          title: 'Limpar Registros de Import',
          dangerLevel: 'low' as const,
          message: `Esta ação irá remover todos os registros de arquivos importados.

Isso permite reimportar arquivos que estavam dando erro de "já importado".

As transações NÃO serão deletadas, apenas os registros de controle.`,
          confirmText: 'Limpar Registros',
          onConfirm: handleClearImports
        }
      
      case 'delete-period':
        return {
          title: 'Excluir Transações do Período',
          dangerLevel: 'high' as const,
          message: `Você está prestes a EXCLUIR PERMANENTEMENTE todas as transações de ${monthName} ${selectedYear}.

Esta ação NÃO PODE ser desfeita!`,
          data: {
            count: preview?.count,
            amount: preview?.totalAmount,
            period: `${monthName} ${selectedYear}`
          },
          confirmText: 'EXCLUIR TRANSAÇÕES',
          onConfirm: handleDeletePeriod
        }
      
      case 'delete-all':
        return {
          title: 'DELETAR TODAS AS TRANSAÇÕES',
          dangerLevel: 'extreme' as const,
          message: `Você está prestes a DELETAR TODAS AS TRANSAÇÕES do seu banco de dados!

Esta ação irá:
- Remover TODAS as suas transações
- Zerar todos os dados financeiros
- Apagar todo o histórico

⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️`,
          confirmText: 'CONFIRMO EXCLUSÃO TOTAL',
          requireTextConfirmation: true,
          confirmationPhrase: 'CONFIRMO EXCLUSÃO TOTAL',
          onConfirm: handleDeleteAll
        }
      
      default:
        return null
    }
  }

  const modalConfig = getModalConfig()

  return (
    <div className="space-y-6">
      {/* Zona de Perigo - Reset Completo */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-300 mb-4">
          🚨 Zona de Perigo - Reset Completo
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            Esta operação remove TODAS as transações do banco de dados. Use com extrema cautela!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openModal('clear-imports')}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              {isLoading ? 'Limpando...' : '🗂️ Limpar Registros de Import'}
            </button>
            
            <button
              onClick={() => openModal('delete-all')}
              disabled={isLoading}
              className="bg-red-700 hover:bg-red-800 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold border-2 border-red-500 shadow-lg"
            >
              {isLoading ? 'DELETANDO TUDO...' : '🗗️ DELETAR TODAS AS TRANSAÇÕES'}
            </button>
          </div>
          
          <p className="text-blue-400 text-xs">
            Limpar registros permite reimportar arquivos que estavam bloqueados.
          </p>
          <p className="text-red-400 text-xs">
            Deletar tudo remove TODAS as transações do banco de dados. Ação irreversível!
          </p>
          
          {/* Resultado da limpeza de imports */}
          {clearImportsResult && (
            <div className={`rounded-lg p-4 ${clearImportsResult.success ? 'bg-green-800/50' : 'bg-red-800/50'}`}>
              <h4 className={`font-medium mb-2 ${clearImportsResult.success ? 'text-green-300' : 'text-red-300'}`}>
                {clearImportsResult.success ? '✅ Registros Limpos' : '🚨 Erro na Limpeza'}
              </h4>
              <p className="text-gray-300 text-sm">{clearImportsResult.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Exclusão por Período */}
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-800/30 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
          🗗️ Gerenciar Importações por Período
        </h3>
        
        <div className="space-y-4">
          {/* Seletores */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Selecione o mês</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              disabled={isLoading || !selectedMonth}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              {isLoading ? 'Carregando...' : 'Visualizar Transações'}
            </button>
            
            {preview && preview.count > 0 && (
              <button
                onClick={() => openModal('delete-period')}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {isLoading ? 'Excluindo...' : `EXCLUIR ${preview.count} Transações`}
              </button>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">
                📋 Transações encontradas em {months.find(m => m.value === selectedMonth)?.label} {selectedYear}:
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-blue-400 font-bold text-lg">
                    {preview.count}
                  </div>
                  <div className="text-xs text-gray-400">Total</div>
                  <div className="text-sm text-blue-300">Transações</div>
                </div>
                
                <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 font-bold text-lg">
                    {formatCurrency(preview.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-400">Valor Total</div>
                  <div className="text-sm text-yellow-300">das Transações</div>
                </div>
              </div>
            </div>
          )}

          {/* Resultado da exclusão */}
          {result && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2">
                ✅ Exclusão Concluída com Sucesso!
              </h4>
              <p className="text-gray-300 text-sm">
                {result.deleted} transações foram removidas. Impacto no saldo: {formatCurrency(result.totalImpact)}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                A página será recarregada automaticamente...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação - Debug */}
      {modalId && modalConfig && (
        <ConfirmationModal
          {...modalConfig}
          modalId={modalId}
          isLoading={isLoading}
          onCancel={closeModal}
        />
      )}
      
      {/* Debug info - vou remover depois */}
      {modalId && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-50">
          Modal ID: {modalId} | Config: {modalConfig ? 'OK' : 'NULL'}
        </div>
      )}
    </div>
  )
} 
