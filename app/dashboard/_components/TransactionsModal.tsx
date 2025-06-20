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
        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-gray-900/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-800/50 space-y-3 lg:space-y-0"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1 truncate text-sm lg:text-base">{transaction.description}</p>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-4 text-xs lg:text-sm">
                        <span className="text-gray-400 truncate">
                          {transaction.categoryName || 'Sem categoria'}
                        </span>
                        <span className="text-gray-500 lg:hidden">
                          {formatDateIntl(transaction.date)}
                        </span>
                        <span className="text-gray-500 hidden lg:block">
                          {formatDateIntl(transaction.date)}
                        </span>
                        <span className="text-gray-500 hidden lg:block">
                          {formatRelativeDateBR(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-end space-y-1 lg:space-y-0">
                    <p className={`text-lg lg:text-xl font-bold ${
                      transaction.type === 'income'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-gray-500 text-xs lg:hidden">
                      {formatRelativeDateBR(transaction.date)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {paginatedData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800/50">
                <div className="text-sm text-gray-400">
                  Página {paginatedData.currentPage} de {paginatedData.totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(paginatedData.currentPage - 1)}
                    disabled={paginatedData.currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
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
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-400">Não há transações para o período selecionado.</p>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  )
} 
