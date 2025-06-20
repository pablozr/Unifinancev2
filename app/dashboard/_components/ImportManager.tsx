'use client'

import { useState } from 'react'
import { deleteAllImportedTransactions, previewDeletionByPeriod, clearAllImportRecords, type DeleteResult } from '../_actions/deleteTransactions'
import { formatCurrency } from '@/lib/utils/currency'


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
      alert('Selecione um mês')
      return
    }

    setIsLoading(true)
    try {
      const startDate = new Date(selectedYear, parseInt(selectedMonth) - 1, 1)
      const endDate = new Date(selectedYear, parseInt(selectedMonth), 0, 23, 59, 59)

      const previewResult = await previewDeletionByPeriod(userId, startDate, endDate)

      setPreview(previewResult)
    } catch (error) {
      alert('Erro ao visualizar transações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!preview || preview.count === 0) {
      return
    }

    const monthName = months.find(m => m.value === selectedMonth)?.label
    const confirmMessage = `⚠️ ATENÇÃO: Você está prestes a EXCLUIR PERMANENTEMENTE todas as ${preview.count} transações de ${monthName} ${selectedYear}.\n\nImpacto no saldo: R$ ${preview.totalAmount.toFixed(2)}\n\nEsta ação NÃO PODE ser desfeita!\n\nTem certeza absoluta?`

    if (!confirm(confirmMessage)) {
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
      alert('Erro ao excluir transações')
    } finally {
      setIsLoading(false)
    }
  }



  const handleClearImports = async () => {
    const confirmMessage = `🗂️ LIMPAR REGISTROS DE IMPORT\n\nEsta ação irá remover todos os registros de arquivos importados.\n\nIsso permite reimportar arquivos que estavam dando erro de "já importado".\n\nAs transações NÃO serão deletadas, apenas os registros de controle.\n\nDeseja continuar?`

    if (!confirm(confirmMessage)) {
      return
    }

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
    const confirmMessage = `🚨 ATENÇÃO EXTREMA! 🚨

Você está prestes a DELETAR TODAS AS TRANSAÇÕES do seu banco de dados!

Esta ação irá:
- Remover TODAS as suas transações
- Zerar todos os dados financeiros
- Apagar todo o histórico

⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️

Digite "CONFIRMO EXCLUSÃO TOTAL" para continuar:`

    const confirmed = prompt(confirmMessage)
    
    if (confirmed !== 'CONFIRMO EXCLUSÃO TOTAL') {
      alert('Operação cancelada. Texto de confirmação incorreto.')
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteAllImportedTransactions(userId, new Date(), new Date())
      setResult(result)
      
      alert(`✅ SUCESSO! ${result.deleted} transações foram deletadas. A página será recarregada.`)
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      alert(`🚨 Erro: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }



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
              onClick={handleClearImports}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              {isLoading ? 'Limpando...' : '🗂️ Limpar Registros de Import'}
            </button>
            
            <button
              onClick={handleDeleteAll}
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
                onClick={handleDelete}
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
    </div>
  )
} 
