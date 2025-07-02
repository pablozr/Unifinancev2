'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'

interface FixedVariableChartProps {
  data: {
    fixed: number
    variable: number
    recurringTransactions: any[]
  } | null
}

// Cores para o tema preto puro
const COLORS = ['#3B82F6', '#10B981'] // Azul e Verde mais vibrantes

export default function FixedVariableChart({ data }: FixedVariableChartProps) {
  if (!data || (data.fixed === 0 && data.variable === 0)) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-300 text-lg font-medium mb-2">
            Nenhuma despesa encontrada
          </p>
          <p className="text-gray-500 text-sm">
            Não há dados de despesas para o período selecionado.
          </p>
        </div>
      </div>
    )
  }

  const chartData = [
    { name: 'Despesas Fixas', value: data.fixed },
    { name: 'Despesas Variáveis', value: data.variable },
  ]

  const total = data.fixed + data.variable
  const fixedPercentage = total > 0 ? (data.fixed / total) * 100 : 0
  const variablePercentage = total > 0 ? (data.variable / total) * 100 : 0

  // Tooltip preto puro
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-black border border-gray-700 rounded-lg p-3 shadow-2xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300 text-sm">
            {formatCurrency(data.value)}
          </p>
          <p className="text-gray-500 text-xs">
            {((data.value / total) * 100).toFixed(1)}% do total
          </p>
        </div>
      )
    }
    return null
  }

  // Legend preta
  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center space-x-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-sm font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas pretos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(data.fixed)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Despesas Fixas</div>
          <div className="text-blue-300 text-xs mt-1">
            {fixedPercentage.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(data.variable)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Despesas Variáveis</div>
          <div className="text-green-300 text-xs mt-1">
            {variablePercentage.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-white">
            {formatCurrency(total)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Total</div>
          <div className="text-gray-500 text-xs mt-1">
            100%
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-purple-400">
            {data.recurringTransactions.length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Recorrentes</div>
          <div className="text-purple-300 text-xs mt-1">
            Detectadas
          </div>
        </div>
      </div>

      {/* Gráfico de pizza preto */}
      <div className="h-80 bg-black border border-gray-800 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ percent }: { percent?: number }) =>
                percent ? `${(percent * 100).toFixed(1)}%` : ''
              }
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#000000"
                  strokeWidth={3}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 