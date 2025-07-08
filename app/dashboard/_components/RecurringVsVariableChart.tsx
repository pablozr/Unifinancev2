'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { formatCurrency, formatPercentage } from '@/lib/utils/currency'

export interface ChartData {
  name: string
  value: number
  color: string
}

interface RecurringVsVariableChartProps {
  data: ChartData[]
  title: string
}

const PieSlice = ({
  item,
  startAngle,
  endAngle,
  onHover,
  isHovered
}: {
  item: ChartData
  startAngle: number
  endAngle: number
  onHover: (item: ChartData | null) => void
  isHovered: boolean
}) => {
  const baseRadius = 85
  const innerRadius = 55
  const radius = isHovered ? baseRadius + 4 : baseRadius

  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  // Outer arc
  const startX_outer = Math.cos(startAngle) * radius
  const startY_outer = Math.sin(startAngle) * radius
  const endX_outer = Math.cos(endAngle) * radius
  const endY_outer = Math.sin(endAngle) * radius

  // Inner arc
  const startX_inner = Math.cos(startAngle) * innerRadius
  const startY_inner = Math.sin(startAngle) * innerRadius
  const endX_inner = Math.cos(endAngle) * innerRadius
  const endY_inner = Math.sin(endAngle) * innerRadius

  const d = [
    `M ${startX_outer} ${startY_outer}`, // Move to outer start point
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX_outer} ${endY_outer}`, // Outer arc
    `L ${endX_inner} ${endY_inner}`, // Line to inner end point
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX_inner} ${startY_inner}`, // Inner arc (reversed)
    'Z' // Close path
  ].join(' ')

  return (
    <motion.path
      d={d}
      fill={item.color}
      stroke="#0a0a0a"
      strokeWidth={2}
      onMouseEnter={() => onHover(item)}
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    />
  )
}

export function RecurringVsVariableChart({ data, title }: RecurringVsVariableChartProps) {
  const [hoveredItem, setHoveredItem] = useState<ChartData | null>(null)
  
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
     return (
       <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
        <h3 className="text-xl font-medium text-white mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center border-2 border-dashed border-white/[0.08] rounded-lg">
          <p className="text-white/60">Sem dados de despesas para exibir.</p>
        </div>
      </div>
     )
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  let startAngle = -Math.PI / 2

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden flex flex-col min-h-[350px]"
    >
      <h3 className="text-xl font-medium text-white mb-4 flex-shrink-0">{title}</h3>
      <div className="flex-grow flex items-center justify-center flex-wrap gap-x-6 gap-y-4">
        <div className="relative w-[220px] h-[220px]">
          <svg viewBox="-100 -100 200 200" className="w-full h-full">
            {data.map(item => {
              const angle = (item.value / totalValue) * 2 * Math.PI
              const endAngle = startAngle + angle
              const slice = (
                <PieSlice
                  key={item.name}
                  item={item}
                  startAngle={startAngle}
                  endAngle={endAngle}
                  onHover={setHoveredItem}
                  isHovered={hoveredItem?.name === item.name}
                />
              )
              startAngle = endAngle
              return slice
            })}
          </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {hoveredItem ? (
                <>
                  <p className="text-2xl font-bold text-white">{formatPercentage(hoveredItem.value / totalValue)}</p>
                  <p className="text-sm text-gray-400">{hoveredItem.name}</p>
                </>
            ) : (
                <>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
                </>
            )}
          </div>
        </div>

        <div className="w-full max-w-[220px] space-y-3">
          {data.map(item => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{formatCurrency(item.value)}</p>
                <p className="text-gray-500">{formatPercentage(item.value / totalValue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
} 