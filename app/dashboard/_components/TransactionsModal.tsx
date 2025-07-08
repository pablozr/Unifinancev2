'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { getAllTransactions } from '../_data'
import type { PaginatedTransactions, PeriodFilter } from '../_data/types'
import { formatDateIntl, formatRelativeDateBR } from '@/lib/utils/validDate'
import { formatCurrency } from '@/lib/utils/currency'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import BaseModal from '@/components/ui/BaseModal'

interface TransactionsModalProps {
  userId: string
  currentFilter: PeriodFilter
}

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

export function TransactionsModal({ userId, currentFilter }: TransactionsModalProps) {
  const [isOpen, setIsOpen] = useQueryState('transacoes', {
    defaultValue: '',
    serialize: (value) => value === 'todas' ? 'todas' : '',
    parse: (value) => value
  })
  
  const [currentPage, setCurrentPage] = useQueryState('pagina', {
    defaultValue: 1,
    serialize: (value) => value.toString(),
    parse: (value) => parseInt(value) || 1
  })

  const [paginatedData, setPaginatedData] = useState<PaginatedTransactions | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isModalOpen = isOpen === 'todas'

  const openModal = useCallback(() => {
    setIsOpen('todas')
    setCurrentPage(1)
  }, [setIsOpen, setCurrentPage])

  const closeModal = useCallback(() => {
    setIsOpen('')
    setCurrentPage(1)
  }, [setIsOpen, setCurrentPage])

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllTransactions(userId, currentPage, 10, currentFilter)
      setPaginatedData(data)
    } catch (error) {
      // ... existing code ...
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentPage, currentFilter])

  useEffect(() => {
    if (isModalOpen) {
      loadTransactions()
    }
  }, [isModalOpen, currentPage, currentFilter, loadTransactions])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getSubtitle = () => {
    const count = paginatedData ? `${paginatedData.totalCount} transações encontradas` : 'Carregando...'
    const filterLabel = currentFilter && currentFilter.type !== 'custom' ? (
      currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined
        ? ` • ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][currentFilter.month]} ${currentFilter.year}`
        : currentFilter.type === 'yearly' && currentFilter.year
        ? ` • Ano ${currentFilter.year}`
        : ' • Últimos 6 meses'
    ) : ''
    
    return count + filterLabel
  }

  return (
    <>
      {/* Botão para abrir o modal */}
      <button 
        onClick={openModal}
        className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium transition-colors duration-200"
      >
        Ver todas
      </button>

      {/* Modal */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Todas as Transações"
        subtitle={getSubtitle()}
        size="xl"
      >
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-sm sm:text-base">Carregando transações...</p>
            </div>
          </div>
        ) : paginatedData && paginatedData.transactions.length > 0 ? (
          <>
            {/* Lista de Transações */}
            <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {paginatedData.transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-gray-900/50 rounded-lg sm:rounded-xl transition-all duration-200 border border-transparent hover:border-gray-800/50 space-y-2 sm:space-y-0"
                >
                  {/* Left side: Icon + Description */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1 truncate text-sm sm:text-base lg:text-base" title={transaction.description}>
                        {transaction.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 lg:space-x-4 text-xs sm:text-sm">
                        <span className="text-gray-400 truncate">
                          {transaction.categoryName || 'Sem categoria'}
                        </span>
                        <span className="text-gray-500">{formatDateIntl(transaction.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount */}
                  <div className="self-end sm:self-center">
                    <p className={`text-base sm:text-lg lg:text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {paginatedData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-800/50 space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
                  Página {paginatedData.currentPage} de {paginatedData.totalPages}
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(paginatedData.currentPage - 1)}
                    disabled={paginatedData.currentPage === 1}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                            pageNum === paginatedData.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(paginatedData.currentPage + 1)}
                    disabled={paginatedData.currentPage === paginatedData.totalPages}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-4">📋</div>
              <p className="text-gray-400 text-base sm:text-lg mb-2">Nenhuma transação encontrada</p>
              <p className="text-gray-500 text-sm">
                {currentFilter && currentFilter.type !== 'custom' 
                  ? 'Tente selecionar um período diferente'
                  : 'Suas transações aparecerão aqui quando adicionadas'
                }
              </p>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  )
} 
