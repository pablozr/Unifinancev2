'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useQueryState } from 'nuqs'
import BaseModal from '@/components/ui/BaseModal'
import { getAllTransactions } from '../_data'
import { markAsRecurring } from '../_actions/markAsRecurring'
import type { PaginatedTransactions, PeriodFilter } from '../_data/types'
import { formatCurrency } from '@/lib/utils/currency'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { PeriodSelector } from './PeriodSelector'

type Transaction = PaginatedTransactions['transactions'][0]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
    >
      {pending ? 'Salvando...' : 'Salvar Alterações'}
    </button>
  )
}

export default function ManageRecurringModal({ userId }: { userId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useQueryState('modal', {
    defaultValue: '',
    serialize: (value) => (value === 'manage-recurring' ? 'manage-recurring' : ''),
    parse: (value) => value,
  })

  const [currentPage, setCurrentPage] = useQueryState('pagina_recorrente', {
    defaultValue: 1,
    serialize: (value) => value.toString(),
    parse: (value) => parseInt(value) || 1,
  })
  
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>({ type: 'custom' })
  const [paginatedData, setPaginatedData] = useState<PaginatedTransactions | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)

  const isModalOpen = isOpen === 'manage-recurring'

  const handleClose = useCallback(() => {
    setIsOpen('')
    setCurrentPage(1)
  }, [setIsOpen, setCurrentPage])

  const loadTransactions = useCallback(async () => {
    if (!isModalOpen) return
    setIsLoading(true)
    try {
      const data = await getAllTransactions(userId, currentPage, 50, currentFilter)
      setPaginatedData(data)

      // Inicializa ou atualiza checkboxes
      setSelected((prev) => {
        const newSelected: Record<string, boolean> = { ...prev }
        data.transactions.forEach((t) => {
          if (newSelected[t.id] === undefined) {
            newSelected[t.id] = !!t.is_recurring
          }
        })
        return newSelected
      })
    } catch (error) {
      console.error('Falha ao carregar transações:', error)
      setPaginatedData(null)
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentPage, currentFilter, isModalOpen])

  useEffect(() => {
    // Carrega transações quando o modal abre ou a página/período muda
    if (isModalOpen) {
      loadTransactions()
    } else {
      // Limpa os dados quando o modal fecha
      setPaginatedData(null)
      setSelected({})
    }
  }, [isModalOpen, currentPage, currentFilter, loadTransactions])
  
  const handlePageChange = (page: number) => {
    if (page > 0 && (!paginatedData || page <= paginatedData.totalPages)) {
      setCurrentPage(page)
    }
  }

  const handleCheckboxChange = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const [state, formAction] = useFormState(markAsRecurring, { message: '' })

  useEffect(() => {
    // Se a ação do formulário foi bem-sucedida, atualiza os dados do dashboard
    if (state?.message?.startsWith('Sucesso')) {
      router.refresh()
      
      const timer = setTimeout(() => {
        handleClose() // Fecha o modal após o sucesso
      }, 1500) // Aguarda 1.5s para o usuário ler a mensagem

      return () => clearTimeout(timer)
    }
  }, [state, router, handleClose])

  // O form precisa de todos os IDs de transações da página atual
  // para desmarcar aqueles que não estão mais selecionados.
  const allTransactionIdsOnPage = paginatedData?.transactions.map(t => t.id) || []

  const transactions = paginatedData?.transactions || []
  const totalPages = paginatedData?.totalPages || 1
  const page = paginatedData?.currentPage || 1

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={handleClose}
      title="Gerenciar Despesas Recorrentes"
      subtitle={
        paginatedData
          ? `${paginatedData.totalCount} transações encontradas`
          : 'Selecione as transações que se repetem mensalmente.'
      }
      size="xl"
    >
      <form action={formAction} className="flex flex-col">
        {/* Passa todos os IDs da página como um campo oculto */}
        <input type="hidden" name="allTransactionIdsOnPage" value={JSON.stringify(allTransactionIdsOnPage)} />
        
        {/* Controles */}
        <div className="mb-4">
          <PeriodSelector currentFilter={currentFilter} onPeriodChange={setCurrentFilter} />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 min-h-0 max-h-[55vh]">
          {isLoading && !paginatedData ? (
             <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length > 0 ? (
            <ul className="space-y-2">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-900/50 hover:bg-gray-900/80 rounded-lg sm:rounded-xl transition-all duration-200 border border-transparent hover:border-gray-800/50 space-y-2 sm:space-y-0"
                >
                  {/* Left side: Checkbox + Description */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      name="selectedTransactionIds"
                      value={t.id}
                      checked={!!selected[t.id]}
                      onChange={() => handleCheckboxChange(t.id)}
                      className="form-checkbox h-5 w-5 flex-shrink-0 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate" title={t.description}>
                        {t.description}
                      </p>
                      <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Right side: Amount */}
                  <div className="self-end sm:self-center">
                    <span className={`font-medium text-base sm:text-lg ${t.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                      {t.type === 'expense' ? '- ' : '+ '}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p>Nenhuma transação encontrada para este período.</p>
            </div>
          )}
        </div>
        <div className="pt-4 mt-4 border-t border-gray-800 flex flex-col space-y-4">
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              {(() => {
                const maxVisible = 5
                let start = Math.max(1, page - Math.floor(maxVisible / 2))
                let end = start + maxVisible - 1
                if (end > totalPages) {
                  end = totalPages
                  start = Math.max(1, end - maxVisible + 1)
                }
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
                return pages.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))
              })()}

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isLoading}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <SubmitButton />
          {state?.message && <p className="text-sm text-center text-gray-400 mt-2">{state.message}</p>}
        </div>
      </form>
    </BaseModal>
  )
} 