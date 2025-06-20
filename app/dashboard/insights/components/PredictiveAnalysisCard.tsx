'use client'

// import { motion } from 'framer-motion' // não utilizado
import { formatCurrency } from '@/lib/utils/currency'
import type { PredictiveAnalysis } from '../_data'
import { TrendingUp, TrendingDown, Minus, AlertCircle, BarChart3, Calendar, Clock, CheckCircle, Info } from 'lucide-react'
import { useMemo } from 'react'

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border ${className || ''}`}>{children}</div>
)

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
)

const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className || ''}`}>{children}</h3>
)

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>{children}</div>
)

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || 'bg-gray-100 text-gray-800'}`}>
    {children}
  </span>
)

interface RecurringTransaction {
  description: string
  averageAmount: number
  frequency: 'weekly' | 'monthly' | 'quarterly'
  intervalDays: number
  confidence: number
  category: string
  type: 'income' | 'expense'
  nextExpectedDate: Date
}

// CashFlowProjection interface removida por não estar sendo utilizada

interface PredictiveAnalysisCardProps {
  analysis: PredictiveAnalysis | null
  loading: boolean
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

const formatFrequency = (frequency: 'weekly' | 'monthly' | 'quarterly') => {
  const map = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    quarterly: 'Trimestral'
  }
  return map[frequency]
}

export default function PredictiveAnalysisCard({ analysis, loading }: PredictiveAnalysisCardProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  // getConfidenceColor removido por não ser utilizado

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) {return 'bg-green-100 text-green-800'}
    if (confidence >= 60) {return 'bg-yellow-100 text-yellow-800'}
    return 'bg-red-100 text-red-800'
  }

  const svgData = useMemo(() => {
    if (!analysis) {return null}

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const currentMonth = new Date().getMonth()
    
    const historicalMonths = 6
    const futureMonths = 3
    const totalPoints = historicalMonths + futureMonths
    
    const baseIncome = analysis.nextMonthIncome * 0.95
    const baseExpenses = analysis.nextMonthExpenses * 0.95
    const volatility = analysis.volatilityScore || 0.1
    const seasonalityFactor = analysis.seasonalityFactor || 1

    const dataPoints = []
    
    for (let i = -historicalMonths; i < futureMonths; i++) {
      const monthIndex = (currentMonth + i + 12) % 12
      const isHistorical = i < 0
      const isFuture = i >= 0
      
      const trendMultiplier = 1 + (analysis.trendStrength || 0) * i / 10000
      
      const seasonalMultiplier = 1 + Math.sin((monthIndex / 12) * 2 * Math.PI) * (seasonalityFactor - 1) * 0.1
      
      const noiseMultiplier = isHistorical 
        ? 1 + (Math.random() - 0.5) * volatility * 0.5 
        : 1
      
      let income = baseIncome * trendMultiplier * seasonalMultiplier * noiseMultiplier
      let expenses = baseExpenses * trendMultiplier * seasonalMultiplier * noiseMultiplier
      
      if (i === 0) {
        income = analysis.nextMonthIncome
        expenses = analysis.nextMonthExpenses
      }
      
      income = Math.max(0, income)
      expenses = Math.max(0, expenses)
      
      dataPoints.push({
        month: months[monthIndex],
        income,
        expenses,
        balance: income - expenses,
        isHistorical,
        isFuture,
        x: (i + historicalMonths) * (300 / (totalPoints - 1))
      })
    }

    const allValues = dataPoints.flatMap(d => [d.income, d.expenses, Math.abs(d.balance)])
    const maxValue = Math.max(...allValues) * 1.1
    const minValue = Math.min(...dataPoints.map(d => d.balance)) * 1.1

    const normalize = (value: number) => {
      const range = maxValue - minValue
      return 180 - ((value - minValue) / range) * 160
    }

    const incomePoints = dataPoints.map(d => `${d.x},${normalize(d.income)}`).join(' ')
    const expensePoints = dataPoints.map(d => `${d.x},${normalize(d.expenses)}`).join(' ')
    const balancePoints = dataPoints.map(d => `${d.x},${normalize(d.balance)}`).join(' ')

    const separationX = (historicalMonths) * (300 / (totalPoints - 1))

    return {
      dataPoints,
      incomePoints,
      expensePoints,
      balancePoints,
      separationX,
      maxValue,
      minValue,
      normalize
    }
  }, [analysis])

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Preditiva Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-20 bg-gray-700 rounded animate-pulse" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-16 bg-gray-700 rounded animate-pulse" />
              <div className="h-16 bg-gray-700 rounded animate-pulse" />
              <div className="h-16 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Preditiva Avançada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 text-center py-8">
            Dados insuficientes para análise preditiva
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Preditiva Avançada
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(analysis.trend)}
            <Badge className={getConfidenceBadgeColor(analysis.confidence)}>
              {analysis.confidence}% confiança
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alertas de Fluxo de Caixa */}
        {analysis.cashFlowProjection?.alertDays && analysis.cashFlowProjection.alertDays.length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
              <AlertCircle className="h-4 w-4" />
              Alerta de Fluxo de Caixa
            </div>
            <p className="text-red-300 text-sm">
              Saldo pode ficar negativo em {analysis.cashFlowProjection.alertDays[0]} dias
            </p>
          </div>
        )}

        {/* Gráfico de Projeção */}
        {svgData && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Projeção Multi-Linha</h4>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <svg viewBox="0 0 320 200" className="w-full h-48">
                <defs>
                  <linearGradient id="incomeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.8"/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#f87171" stopOpacity="0.8"/>
                  </linearGradient>
                  <linearGradient id="balanceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="300" height="180" fill="url(#grid)" />
                
                {/* Linha de separação histórico/futuro */}
                <line 
                  x1={svgData.separationX} 
                  y1="0" 
                  x2={svgData.separationX} 
                  y2="180" 
                  stroke="#6b7280" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                />
                <text x={svgData.separationX + 5} y="15" fill="#9ca3af" fontSize="10">Hoje</text>
                
                {/* Linhas de dados */}
                <polyline
                  fill="none"
                  stroke="url(#incomeGrad)"
                  strokeWidth="2"
                  points={svgData.incomePoints}
                  strokeDasharray={`0,${svgData.separationX * 2},10,5`}
                />
                <polyline
                  fill="none"
                  stroke="url(#expenseGrad)"
                  strokeWidth="2"
                  points={svgData.expensePoints}
                  strokeDasharray={`0,${svgData.separationX * 2},10,5`}
                />
                <polyline
                  fill="none"
                  stroke="url(#balanceGrad)"
                  strokeWidth="2"
                  points={svgData.balancePoints}
                  strokeDasharray={`0,${svgData.separationX * 2},10,5`}
                />
                
                {/* Pontos dos dados futuros com efeito glow */}
                {svgData.dataPoints
                  .filter(d => d.isFuture)
                  .map((point, i) => (
                    <g key={i}>
                      <circle
                        cx={point.x}
                        cy={svgData.normalize(point.income)}
                        r="3"
                        fill="#10b981"
                        filter="url(#glow)"
                      >
                        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={point.x}
                        cy={svgData.normalize(point.expenses)}
                        r="3"
                        fill="#ef4444"
                        filter="url(#glow)"
                      >
                        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle
                        cx={point.x}
                        cy={svgData.normalize(point.balance)}
                        r="3"
                        fill="#3b82f6"
                        filter="url(#glow)"
                      >
                        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
                      </circle>
                    </g>
                  ))}
                
                {/* Labels dos meses */}
                {svgData.dataPoints.map((point, i) => (
                  <text
                    key={i}
                    x={point.x}
                    y="195"
                    fill="#9ca3af"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {point.month}
                  </text>
                ))}
              </svg>
              
              {/* Legenda */}
              <div className="flex justify-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-green-500" />
                  <span className="text-green-400">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500" />
                  <span className="text-red-400">Despesas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-blue-500" />
                  <span className="text-blue-400">Saldo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas de Predição */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-green-400 text-sm font-medium">Receita Prevista</div>
            <div className="text-white text-lg font-bold">{formatCurrency(analysis.nextMonthIncome)}</div>
            <div className="text-xs text-gray-400">RÂ² {(analysis.historicalAccuracy || 0).toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-red-400 text-sm font-medium">Despesa Prevista</div>
            <div className="text-white text-lg font-bold">{formatCurrency(analysis.nextMonthExpenses)}</div>
            <div className="text-xs text-gray-400">Volatilidade {((analysis.volatilityScore || 0) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-800/30 p-3 rounded-lg">
            <div className="text-blue-400 text-sm font-medium">Saldo Previsto</div>
            <div className={`text-lg font-bold ${analysis.nextMonthBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(analysis.nextMonthBalance)}
            </div>
            <div className="text-xs text-gray-400">Tendência {analysis.trend}</div>
          </div>
        </div>

        {/* Projeção de Fluxo de Caixa */}
        {analysis.cashFlowProjection && (
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Projeção de Fluxo de Caixa
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-gray-400 text-xs">30 dias</div>
                <div className={`font-bold ${analysis.cashFlowProjection.next30Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(analysis.cashFlowProjection.next30Days)}
                </div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-gray-400 text-xs">60 dias</div>
                <div className={`font-bold ${analysis.cashFlowProjection.next60Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(analysis.cashFlowProjection.next60Days)}
                </div>
              </div>
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <div className="text-gray-400 text-xs">90 dias</div>
                <div className={`font-bold ${analysis.cashFlowProjection.next90Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(analysis.cashFlowProjection.next90Days)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-900/20 border border-green-700 p-2 rounded">
                <div className="text-green-400 text-xs">Receitas Recorrentes</div>
                <div className="text-green-300 font-bold">{formatCurrency(analysis.cashFlowProjection.recurringIncome)}</div>
              </div>
              <div className="bg-red-900/20 border border-red-700 p-2 rounded">
                <div className="text-red-400 text-xs">Despesas Recorrentes</div>
                <div className="text-red-300 font-bold">{formatCurrency(analysis.cashFlowProjection.recurringExpenses)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Transações Recorrentes Detectadas */}
        {analysis.recurringTransactions && analysis.recurringTransactions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Transações Recorrentes Detectadas ({analysis.recurringTransactions.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {analysis.recurringTransactions.slice(0, 6).map((transaction: RecurringTransaction, index: number) => (
                <div key={index} className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-white text-sm">{transaction.description}</div>
                    <Badge className="text-xs border border-gray-300">
                      {transaction.confidence.toFixed(0)}% confiança
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}>
                        {formatCurrency(transaction.averageAmount)}
                      </span>
                      <span className="text-gray-400">{formatFrequency(transaction.frequency)}</span>
                      <span className="text-blue-400">{transaction.category}</span>
                    </div>
                    <div className="text-gray-400">
                      Próxima: {formatDate(transaction.nextExpectedDate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Automáticos */}
        {analysis.automaticInsights && analysis.automaticInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Insights Automáticos
            </h4>
            <div className="space-y-2">
              {analysis.automaticInsights.slice(0, 5).map((insight: string, index: number) => (
                <div key={index} className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                  <p className="text-blue-200 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendação Principal */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium mb-1">Recomendação Inteligente</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
