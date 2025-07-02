'use client'

import { ProjectionPoint } from '@/app/dashboard/insights/_types/projection'
import { formatCurrency } from '@/lib/utils/currency'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'


interface CashFlowProjectionChartProps {
  data: ProjectionPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-black border border-gray-700 rounded-lg p-4 shadow-2xl">
        <p className="text-white font-medium mb-2">{`Data: ${label}`}</p>
        <div className="space-y-1 text-sm">
          <p className="text-green-400">
            {`Cenário Otimista: ${formatCurrency(data.optimistic)}`}
          </p>
          <p className="text-blue-400">
            {`Projeção Base: ${formatCurrency(data.balance)}`}
          </p>
          <p className="text-red-400">
            {`Cenário Pessimista: ${formatCurrency(data.pessimistic)}`}
          </p>
          <p className="text-gray-400">
            {`Confiança: ${(data.confidence * 100).toFixed(1)}%`}
          </p>
        </div>
      </div>
    )
  }
  return null
}

export default function CashFlowProjectionChart({ data }: CashFlowProjectionChartProps) {
  const dataToUse = data
  
  if (!dataToUse || dataToUse.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-300 text-lg font-medium mb-2">
            Não foi possível gerar a projeção.
          </p>
          <p className="text-gray-500 text-sm">
            Adicione mais transações para visualizar uma projeção de fluxo de caixa.
          </p>
        </div>
      </div>
    )
  }

  // Calcular estatísticas da projeção
  const finalProjection = dataToUse[dataToUse.length - 1]
  const initialBalance = dataToUse[0].balance
  const projectedChange = finalProjection.balance - initialBalance
  const averageConfidence = dataToUse.slice(1).reduce((sum, point) => sum + point.confidence, 0) / (dataToUse.length - 1)

  // Encontrar o valor mínimo e máximo para ajustar o gráfico
  const allValues = dataToUse.flatMap(d => [d.balance, d.pessimistic, d.optimistic])
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue
  const yAxisMin = minValue - range * 0.1
  const yAxisMax = maxValue + range * 0.1

  return (
    <div className="space-y-6">

      {/* Estatísticas da Projeção */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className={`text-2xl font-bold ${projectedChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(projectedChange)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Mudança Projetada</div>
          <div className={`text-xs mt-1 ${projectedChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {projectedChange >= 0 ? '+' : ''}{Math.abs(initialBalance) > 0 ? ((projectedChange / Math.abs(initialBalance)) * 100).toFixed(1) : '0'}%
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-blue-400">
            {formatCurrency(finalProjection.balance)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Saldo Projetado</div>
          <div className="text-blue-300 text-xs mt-1">
            30 dias
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-purple-400">
            {(averageConfidence * 100).toFixed(1)}%
          </div>
          <div className="text-gray-400 text-sm mt-1">Confiança Média</div>
          <div className="text-purple-300 text-xs mt-1">
            Da projeção
          </div>
        </div>
        
        <div className="bg-black border border-gray-700 rounded-xl p-4 text-center hover:border-gray-600 transition-colors">
          <div className="text-2xl font-bold text-yellow-400">
            {formatCurrency(finalProjection.optimistic - finalProjection.pessimistic)}
          </div>
          <div className="text-gray-400 text-sm mt-1">Faixa de Variação</div>
          <div className="text-yellow-300 text-xs mt-1">
            Cenários
          </div>
        </div>
      </div>



      {/* Gráfico de Projeção */}
      <div className="h-96 bg-black border border-gray-800 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              {/* Gradiente para área de confiança */}
              <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#374151" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#374151" stopOpacity={0.1}/>
              </linearGradient>
              {/* Gradiente para linha principal */}
              <linearGradient id="mainLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => {
                const date = new Date(str);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              domain={[yAxisMin, yAxisMax]}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Linha de referência do saldo inicial */}
            <ReferenceLine 
              y={initialBalance} 
              stroke="#6B7280" 
              strokeDasharray="5 5"
              label={{ value: "Saldo Inicial", position: "left" }}
            />
            
            {/* Área de confiança (pessimista para otimista) */}
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="none"
              fill="url(#confidenceArea)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              stroke="none"
              fill="#000000"
              fillOpacity={1}
            />
            
            {/* Linha principal de projeção */}
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fill="url(#mainLine)"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legenda */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-300">Projeção Base</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-300">Faixa de Confiança</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-gray-500 border-dashed border border-gray-500"></div>
          <span className="text-gray-300">Saldo Inicial</span>
        </div>
      </div>
    </div>
  )
} 