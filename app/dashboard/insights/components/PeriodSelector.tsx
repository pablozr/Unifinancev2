'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { type PeriodFilter } from '../../_data/types'

interface PeriodSelectorProps {
  onPeriodChange: (filter: PeriodFilter) => void
  currentFilter: PeriodFilter
}

export function PeriodSelector({ onPeriodChange, currentFilter }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ]

  const periodTypes = [
    { value: 'monthly', label: 'Mensal', icon: '📅' },
    { value: 'yearly', label: 'Anual', icon: '📊' },
    { value: 'custom', label: 'Últimos 6 meses', icon: '⏰' }
  ]

  const getCurrentLabel = () => {
    if (currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined) {
      const month = months.find(m => m.value === currentFilter.month)
      return `${month?.label} ${currentFilter.year}`
    } else if (currentFilter.type === 'yearly' && currentFilter.year) {
      return `Ano ${currentFilter.year}`
    } else {
      return 'Últimos 6 meses'
    }
  }

  const handleTypeChange = (type: 'monthly' | 'yearly' | 'custom') => {
    if (type === 'custom') {
      onPeriodChange({ type: 'custom' })
    } else if (type === 'yearly') {
      onPeriodChange({ 
        type: 'yearly', 
        year: currentFilter.year || currentYear 
      })
    } else {
      onPeriodChange({ 
        type: 'monthly', 
        year: currentFilter.year || currentYear,
        month: currentFilter.month ?? new Date().getMonth()
      })
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 text-white hover:bg-white/[0.08] transition-all duration-200"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {currentFilter.type === 'monthly' ? '📅' : 
             currentFilter.type === 'yearly' ? '📊' : '⏰'}
          </span>
          <span className="font-medium">{getCurrentLabel()}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {/* Seletor de Tipo */}
          <div className="p-4 border-b border-white/[0.08]">
            <h3 className="text-sm font-medium text-white/60 mb-3">Tipo de Período</h3>
            <div className="grid grid-cols-3 gap-2">
              {periodTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value as any)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentFilter.type === type.value
                      ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                      : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.05] hover:text-white/80 border border-white/[0.05]'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Seletores de Ano/Mês */}
          {currentFilter.type !== 'custom' && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Seletor de Ano */}
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-2">Ano</h4>
                  <select
                    value={currentFilter.year || currentYear}
                    onChange={(e) => onPeriodChange({
                      ...currentFilter,
                      year: parseInt(e.target.value)
                    })}
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {years.map(year => (
                      <option key={year} value={year} className="bg-black text-white">{year}</option>
                    ))}
                  </select>
                </div>

                {/* Seletor de Mês (apenas para tipo mensal) */}
                {currentFilter.type === 'monthly' && (
                  <div>
                    <h4 className="text-sm font-medium text-white/60 mb-2">Mês</h4>
                    <select
                      value={currentFilter.month ?? new Date().getMonth()}
                      onChange={(e) => onPeriodChange({
                        ...currentFilter,
                        month: parseInt(e.target.value)
                      })}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {months.map(month => (
                        <option key={month.value} value={month.value} className="bg-black text-white">
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botão de Fechar */}
          <div className="p-4 border-t border-white/[0.08]">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 border border-white/[0.08]"
            >
              Aplicar Filtro
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
} 