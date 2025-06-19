'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import BaseModal from '@/components/ui/BaseModal'
import addSingleTransaction, { CreateTransactionData } from '../_actions/addSingleTransaction'

export default function AddTransactionModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get('modal') === 'add-transaction'
  
  const [formData, setFormData] = useState<CreateTransactionData>({
    description: '',
    type: 'debit',
    amount: 0,
    category: '',
    date: new Date()
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await addSingleTransaction(formData)
      
      if (result.success) {
        setFormData({
          description: '',
          type: 'debit',
          amount: 0,
          category: '',
          date: new Date()
        })
        
        closeModal()
        
      } else {
        setError(result.error || 'Erro ao criar transaÃ§Ã£o')
      }
    } catch (err) {
      setError('Erro inesperado ao criar transaÃ§Ã£o')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateTransactionData, value: string | number | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeModal}
      title="Adicionar TransaÃ§Ã£o"
      subtitle="Crie uma nova transaÃ§Ã£o manual"
      size="sm"
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DescriÃ§Ã£o */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            DescriÃ§Ã£o *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
            placeholder="Ex: Compra no supermercado"
            required
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as 'credit' | 'debit')}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
            required
          >
            <option value="debit" className="bg-gray-900">ðŸ’¸ Despesa</option>
            <option value="credit" className="bg-gray-900">ðŸ’° Receita</option>
          </select>
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Valor (R$) *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
            placeholder="0,00"
            required
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Categoria (opcional)
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-200"
            placeholder="Ex: AlimentaÃ§Ã£o, Transporte"
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data
          </label>
          <input
            type="date"
            value={formData.date?.toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('date', new Date(e.target.value))}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white transition-all duration-200"
          />
        </div>

        {/* Erro */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-600/20 border border-red-500/30 rounded-xl"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* BotÃµes */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-3 text-gray-300 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700/50 rounded-xl transition-all duration-200"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              'Criar TransaÃ§Ã£o'
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  )
} 
