'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'

export interface CashFlowData {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
  percentage: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
  title: string
}

export function CashFlowChart({ data, title }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  if (!data || data.length === 0) {
    return (
      <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
        {/* Spotlight effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-white mb-4">{title}</h3>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-white/[0.08] rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">ðŸ“Š</span>
              <p className="text-white/60 text-lg font-medium mb-2">Nenhuma transaÃ§Ã£o encontrada</p>
              <p className="text-white/40 text-sm">Para este perÃ­odo selecionado nÃ£o hÃ¡ dados financeiros.</p>
              <p className="text-white/40 text-sm mt-1">Tente selecionar um perÃ­odo diferente ou importe mais transaÃ§Ãµes.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expenses)))
  const adjustedMaxValue = maxValue > 0 ? maxValue : 1000
  const minBarHeight = 20
  
  return (
    <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
      {/* Spotlight effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-white/60">Receitas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-white/60">Despesas</span>
            </div>
          </div>
        </div>
        
        <div className="h-80 relative pl-20">
          {/* Grid lines de fundo */}
          <div className="absolute inset-0 flex flex-col justify-between h-64">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-white/[0.05] border-dashed" />
            ))}
          </div>
          
          <div className="flex items-end justify-between h-64 space-x-3 relative z-10">
            {data.map((item, index) => {
              const incomeHeight = item.income > 0 
                ? Math.max(minBarHeight, (item.income / adjustedMaxValue) * 220) 
                : minBarHeight / 4
              const expenseHeight = item.expenses > 0 
                ? Math.max(minBarHeight, (item.expenses / adjustedMaxValue) * 220) 
                : minBarHeight / 4
              
              return (
                <motion.div
                  key={index}
                  className="flex-1 flex flex-col items-center relative group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Tooltip melhorado */}
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute bottom-full mb-4 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-lg p-4 text-sm text-white z-20 min-w-48"
                    >
                      <div className="font-medium mb-3 text-center border-b border-white/[0.08] pb-2">
                        {item.month}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            Receitas:
                          </span>
                          <span className="font-medium">{formatCurrency(item.income)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-red-400 flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                            Despesas:
                          </span>
                          <span className="font-medium">{formatCurrency(item.expenses)}</span>
                        </div>
                        <div className="border-t border-white/[0.08] pt-2 flex justify-between font-medium">
                          <span className={item.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                            Saldo:
                          </span>
                          <span className={item.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(item.balance)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Barras melhoradas */}
                  <div className="w-full flex space-x-2 items-end h-full justify-center max-w-16">
                    {/* Barra de Receitas */}
                    <motion.div
                      className="flex-1 bg-green-400 rounded-t-lg min-h-[4px] group-hover:bg-green-300 transition-all duration-300"
                      style={{ 
                        height: `${incomeHeight}px`,
                        minHeight: item.income > 0 ? `${minBarHeight}px` : '4px'
                      }}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${incomeHeight}px`
                      }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: "easeOut" }}
                    />
                    
                    {/* Barra de Despesas */}
                    <motion.div
                      className="flex-1 bg-red-400 rounded-t-lg min-h-[4px] group-hover:bg-red-300 transition-all duration-300"
                      style={{ 
                        height: `${expenseHeight}px`,
                        minHeight: item.expenses > 0 ? `${minBarHeight}px` : '4px'
                      }}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: `${expenseHeight}px`
                      }}
                      transition={{ delay: index * 0.1 + 0.4, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  
                  {/* Label do mÃªs melhorado */}
                  <div className="mt-4 text-center">
                    <span className="text-xs text-white/60 font-medium px-2 py-1 bg-white/[0.05] rounded-full">
                      {item.month}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
          {/* Indicadores de valor no eixo Y */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between text-xs text-white/60 pl-2">
            {[4, 3, 2, 1, 0].map(i => (
              <span key={i} className="text-left bg-white/[0.05] px-2 py-1 rounded whitespace-nowrap">
                {formatCurrency((adjustedMaxValue / 4) * i)}
              </span>
            ))}
          </div>
        </div>
        
        {/* Resumo estatÃ­stico melhorado */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
            <div className="text-lg font-light text-green-400">
              {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
            </div>
            <div className="text-xs text-white/60 mt-1">Total Receitas</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
            <div className="text-lg font-light text-red-400">
              {formatCurrency(data.reduce((sum, d) => sum + d.expenses, 0))}
            </div>
            <div className="text-xs text-white/60 mt-1">Total Despesas</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
            <div className={`text-lg font-light ${
              data.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(data.reduce((sum, d) => sum + d.balance, 0))}
            </div>
            <div className="text-xs text-white/60 mt-1">Saldo LÃ­quido</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
            <div className="text-lg font-light text-white">
              {data.length}
            </div>
            <div className="text-xs text-white/60 mt-1">PerÃ­odos</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CategoryPieChartProps {
  data: CategoryData[]
  title: string
}

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  if (!data || data.length === 0) {
    return (
      <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
        {/* Spotlight effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-white mb-4">{title}</h3>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-white/[0.08] rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">ðŸ¥§</span>
              <p className="text-white/60 text-lg font-medium mb-2">Nenhuma despesa encontrada</p>
              <p className="text-white/40 text-sm">Para este perÃ­odo selecionado nÃ£o hÃ¡ gastos categorizados.</p>
              <p className="text-white/40 text-sm mt-1">Tente selecionar um perÃ­odo diferente ou categorize suas despesas.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  if (total === 0) {
    return (
      <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
        {/* Spotlight effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-medium text-white mb-4">{title}</h3>
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-white/[0.08] rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-2 block">ðŸ’¸</span>
              <p className="text-white/60">Nenhuma despesa registrada</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  let startAngle = 0
  const pieSlices = data.map((item, index) => {
    const percentage = (item.value / total) * 100
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle
    
    const radius = 90
    const centerX = 120
    const centerY = 120
    
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    const slice = {
      ...item,
      pathData,
      percentage
    }
    
    startAngle = endAngle
    return slice
  })
  
  return (
    <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden">
      {/* Spotlight effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rounded-2xl"></div>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-medium text-white mb-6">{title}</h3>
        
        <div className="h-80 flex items-center space-x-6">
          {/* GrÃ¡fico de Pizza maior */}
          <div className="relative flex-shrink-0">
            <svg width="240" height="240" viewBox="0 0 240 240">
              {/* Sombra do cÃ­rculo */}
              <circle 
                cx="120" 
                cy="120" 
                r="90" 
                fill="rgba(0,0,0,0.1)" 
                transform="translate(3, 3)" 
              />
              
              {pieSlices.map((slice, index) => (
                <motion.path
                  key={index}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="2"
                  className={`cursor-pointer transition-all duration-300 ${
                    hoveredIndex === index ? 'opacity-90' : 'opacity-100'
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                  style={{
                    transformOrigin: '120px 120px',
                    transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                    filter: hoveredIndex === index ? 'brightness(1.1)' : 'brightness(1)'
                  }}
                />
              ))}
            </svg>
            
            {/* Valor central melhorado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-white/[0.05] backdrop-blur-sm rounded-full p-4 border border-white/[0.08]">
                <div className="text-xl font-light text-white">
                  {formatCurrency(total)}
                </div>
                <div className="text-xs text-white/60 mt-1">Total Gasto</div>
              </div>
            </div>
          </div>
          
          {/* Legenda melhorada */}
          <div className="flex-1 space-y-3 max-h-64 overflow-y-auto pr-2">
            {data.map((item, index) => (
              <motion.div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer border ${
                  hoveredIndex === index 
                    ? 'bg-white/[0.05] border-white/[0.08]' 
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.03]'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-xs text-white/60">{item.percentage.toFixed(1)}% do total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* EstatÃ­sticas do rodapÃ© */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
            <div className="text-lg font-light text-white">{data.length}</div>
            <div className="text-xs text-white/60">Categorias</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
            <div className="text-lg font-light text-white">
              {formatCurrency(data.length > 0 ? total / data.length : 0)}
            </div>
            <div className="text-xs text-white/60">MÃ©dia</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
            <div className="text-lg font-light text-white">
              {data.length > 0 ? data[0].name : 'N/A'}
            </div>
            <div className="text-xs text-white/60">Maior Gasto</div>
          </div>
        </div>
      </div>
    </div>
  )
} 
