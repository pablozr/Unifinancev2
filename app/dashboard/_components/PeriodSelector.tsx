'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
// import { ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline' // não utilizados
import type { PeriodFilter } from '../_data/types'

interface PeriodSelectorProps {
  onPeriodChange: (filter: PeriodFilter) => void
  currentFilter: PeriodFilter
}

export function PeriodSelector({ onPeriodChange, currentFilter }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
  
  const getDisplayText = () => {
    if (currentFilter.type === 'yearly' && currentFilter.year) {
      return `Ano ${currentFilter.year}`
    }
    if (currentFilter.type === 'monthly' && currentFilter.year && currentFilter.month !== undefined) {
      return `${months[currentFilter.month]} ${currentFilter.year}`
    }
    return 'Últimos 6 meses'
  }

  const handleQuickSelect = (type: 'current-month' | 'current-year' | 'last-6-months') => {
    switch (type) {
      case 'current-month':
        onPeriodChange({
          type: 'monthly',
          year: currentYear,
          month: currentMonth
        })
        break
      case 'current-year':
        onPeriodChange({
          type: 'yearly',
          year: currentYear
        })
        break
      case 'last-6-months':
        onPeriodChange({
          type: 'custom'
        })
        break
    }
    setIsOpen(false)
  }

  const handleYearSelect = (year: number) => {
    onPeriodChange({
      type: 'yearly',
      year
    })
    setIsOpen(false)
  }

  const handleMonthSelect = (year: number, month: number) => {
    onPeriodChange({
      type: 'monthly',
      year,
      month
    })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2 text-white hover:bg-white/[0.08] transition-all duration-200"
      >
        <span className="text-sm font-medium">{getDisplayText()}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-80 bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-lg z-50"
        >
          <div className="p-4">
                      {/* Seleções Rápidas */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white/60 mb-2">Seleções Rápidas</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickSelect('current-month')}
                  className="text-left p-2 text-sm text-white/60 hover:bg-white/[0.05] rounded transition-colors"
                >
                  Mês Atual
                </button>
                <button
                  onClick={() => handleQuickSelect('current-year')}
                  className="text-left p-2 text-sm text-white/60 hover:bg-white/[0.05] rounded transition-colors"
                >
                  Ano Atual
                </button>
                <button
                  onClick={() => handleQuickSelect('last-6-months')}
                  className="text-left p-2 text-sm text-white/60 hover:bg-white/[0.05] rounded transition-colors col-span-2"
                >
                  Últimos 6 Meses
                </button>
              </div>
            </div>

            {/* Seleção por Ano */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/60 mb-2">Por Ano</h4>
              <div className="grid grid-cols-3 gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`p-2 text-sm rounded transition-colors ${
                      currentFilter.type === 'yearly' && currentFilter.year === year
                        ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                        : 'text-white/60 hover:bg-white/[0.05]'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

                    {/* Seleção por Mês */}
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-2">Por Mês</h4>
              <div className="max-h-48 overflow-y-auto">
                {years.slice(0, 2).map(year => (
                  <div key={year} className="mb-3">
                    <div className="text-xs text-white/40 mb-1">{year}</div>
                    <div className="grid grid-cols-4 gap-1">
                      {months.map((month, monthIndex) => {
                        if (year === currentYear && monthIndex > currentMonth) {
                          return null
                        }
                        
                        return (
                          <button
                            key={`${year}-${monthIndex}`}
                            onClick={() => handleMonthSelect(year, monthIndex)}
                            className={`p-1 text-xs rounded transition-colors ${
                              currentFilter.type === 'monthly' && 
                              currentFilter.year === year && 
                              currentFilter.month === monthIndex
                                ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                                : 'text-white/60 hover:bg-white/[0.05]'
                            }`}
                          >
                            {month.slice(0, 3)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 
