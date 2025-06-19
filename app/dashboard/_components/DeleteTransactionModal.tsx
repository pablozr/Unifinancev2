'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { getAllTransactions } from '../_data'
import { deleteSingleTransaction } from '../_actions'
import type { PaginatedTransactions, PeriodFilter } from '../_data/types'
import { formatDateIntl } from '@/lib/utils/validDate'
import { formatCurrency } from '@/lib/utils/currency'
import { PeriodSelector } from './PeriodSelector'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline'
import BaseModal from '@/components/ui/BaseModal'

// Ícones simples em SVG
const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

const TrendingDownIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export default function DeleteTransactionModal({ userId }: { userId: string }) {
  // Estados para controle do modal via nuqs
  const [modalOpen, setModalOpen] = useQueryState('modal', {
    defaultValue: '',
    serialize: (value) => value,
    parse: (value) => value
  })
  
  const [currentPage, setCurrentPage] = useQueryState('page', {
    defaultValue: 1,
    serialize: (value) => value.toString(),
    parse: (value) => parseInt(value) || 1
  })

  // Estados locais
  const [paginatedData, setPaginatedData] = useState<PaginatedTransactions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>({ type: 'custom' })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isModalOpen = modalOpen === 'delete-transaction'

  // Função para fechar o modal
  const closeModal = useCallback(() => {
    setModalOpen('')
    setCurrentPage(1)
  }, [setModalOpen, setCurrentPage])

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllTransactions(userId, currentPage, 10, currentFilter)
      setPaginatedData(data)
    } catch (error) {
      console.error('❌ Error loading transactions for delete:', error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentPage, currentFilter])

  // Carregar dados quando o modal abrir ou página/filtro mudar
  useEffect(() => {
    if (isModalOpen) {
      loadTransactions()
    }
  }, [isModalOpen, currentPage, currentFilter, loadTransactions])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePeriodChange = (filter: PeriodFilter) => {
    setCurrentFilter(filter)
    setCurrentPage(1) // Reset para primeira página
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (deletingId) return // Previne cliques múltiplos
    
    setDeletingId(transactionId)
    try {
      const result = await deleteSingleTransaction(transactionId)
      
      if (result.success) {
        console.log('✅ Transaction deleted successfully')
        // Recarregar dados após deletar
        loadTransactions()
      } else {
        console.error('❌ Failed to delete transaction:', result.error)
        alert('Erro ao deletar transação: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error)
      alert('Erro ao deletar transação')
    } finally {
      setDeletingId(null)
    }
  }

  // Criar subtítulo dinâmico
  const getSubtitle = () => {
    const count = paginatedData ? `${paginatedData.totalCount} transações encontradas` : ''
    return count
  }

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Excluir Transações"
      subtitle={getSubtitle()}
      size="xl"
      showCloseButton={false}
    >
      {/* Header customizado com PeriodSelector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex-1">
          <p className="text-gray-400 text-sm lg:text-base mb-2">
            Selecione as transações que deseja excluir
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Seletor de Período */}
          <PeriodSelector 
            currentFilter={currentFilter}
            onPeriodChange={handlePeriodChange}
          />
          
          <button
            onClick={closeModal}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-xl transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conteúdo do Modal */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando transações...</p>
          </div>
        </div>
      ) : paginatedData && paginatedData.transactions.length > 0 ? (
        <>
          {/* Lista de Transações */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {paginatedData.transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 hover:bg-gray-900/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-800/50"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {transaction.type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate text-sm lg:text-base">
                          {transaction.description}
                        </h3>
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3 text-xs lg:text-sm text-gray-400">
                          <span className="font-medium">{transaction.categoryName || 'Sem categoria'}</span>
                          <span className="hidden lg:inline">•</span>
                          <span>{formatDateIntl(transaction.date)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right mt-2 lg:mt-0">
                        <div className={`text-base lg:text-lg font-semibold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botão de Deletar */}
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="ml-4 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50"
                  title="Excluir transação"
                >
                  {deletingId === transaction.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-400"></div>
                  ) : (
                    <TrashIcon className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Paginação */}
          {paginatedData.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800/50">
              <div className="text-sm text-gray-400">
                Página {paginatedData.currentPage} de {paginatedData.totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(paginatedData.currentPage - 1)}
                  disabled={paginatedData.currentPage <= 1}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                {/* Números das páginas */}
                {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(
                    paginatedData.totalPages - 4,
                    paginatedData.currentPage - 2
                  )) + i
                  
                  if (pageNumber > paginatedData.totalPages) return null
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                        pageNumber === paginatedData.currentPage
                          ? 'bg-red-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(paginatedData.currentPage + 1)}
                  disabled={paginatedData.currentPage >= paginatedData.totalPages}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg text-white mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-400 text-sm">
              Não há transações no período selecionado.
            </p>
          </div>
        </div>
      )}
    </BaseModal>
  )
} 