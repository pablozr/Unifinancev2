'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export interface PeriodFilter {
  type: 'last_30_days' | 'last_3_months' | 'last_6_months' | 'current_year' | 'custom'
  startDate?: Date
  endDate?: Date
}

interface PeriodSelectorProps {
  onPeriodChange: (filter: PeriodFilter) => void
  currentFilter: PeriodFilter
  className?: string
}

export default function PeriodSelector({ onPeriodChange, currentFilter, className = '' }: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const periods = [
    { key: 'last_30_days', label: 'Últimos 30 dias' },
    { key: 'last_3_months', label: 'Últimos 3 meses' },
    { key: 'last_6_months', label: 'Últimos 6 meses' },
    { key: 'current_year', label: 'Ano atual' },
  ] as const

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        {periods.find(p => p.key === currentFilter.type)?.label || 'Selecionar período'}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
        >
          {periods.map((period) => (
            <button
              key={period.key}
              onClick={() => {
                onPeriodChange({ type: period.key })
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                currentFilter.type === period.key ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {period.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
} 