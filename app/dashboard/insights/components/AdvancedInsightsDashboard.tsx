'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PeriodSelector } from './PeriodSelector'
import { FinancialScoreCard } from './FinancialScoreCard'
import PredictiveAnalysisCard from './PredictiveAnalysisCard'
import { SmartInsightsGrid } from './SmartInsightsGrid'
import { 
  getPredictiveAnalysis, 
  getFinancialScore, 
  getSmartInsights,
  type PredictiveAnalysis,
  type FinancialScore,
  type SmartInsight
} from '../_data'
import type { PeriodFilter } from '../../_data/types'

interface AdvancedInsightsDashboardProps {
  userId: string
}

export function AdvancedInsightsDashboard({ userId }: AdvancedInsightsDashboardProps) {
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalysis | null>(null)
  const [financialScore, setFinancialScore] = useState<FinancialScore | null>(null)
  const [smartInsights, setSmartInsights] = useState<SmartInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState<PeriodFilter>({ type: 'custom' })

  const loadAdvancedData = useCallback(async () => {
    setIsLoading(true)
    try {
      
      const [predictive, score, insights] = await Promise.all([
        getPredictiveAnalysis(userId, currentFilter),
        getFinancialScore(userId, currentFilter),
        getSmartInsights(userId, currentFilter)
      ])
      
      setPredictiveData(predictive)
      setFinancialScore(score)
      setSmartInsights(insights)
      
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentFilter])

  useEffect(() => {
    loadAdvancedData()
  }, [loadAdvancedData])

  const handlePeriodChange = (filter: PeriodFilter) => {
    setCurrentFilter(filter)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-black">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto mb-4"></div>
            <p className="text-white/60">Analisando seus dados financeiros...</p>
            <p className="text-white/40 text-sm mt-2">Gerando insights personalizados</p>
          </div>
        </div>
      </div>
    )
  }

  const hasInsufficientData = (!financialScore || financialScore.overallScore === 0) && 
                               (!predictiveData || predictiveData.confidence < 30) && 
                               smartInsights.length === 0

  if (hasInsufficientData) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-black">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-white mb-3">
                Insights AvanÃ§ados
              </h1>
              <p className="text-white/60 text-lg">
                AnÃ¡lises inteligentes e projeÃ§Ãµes para suas finanÃ§as
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dados Insuficientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12">
            <div className="text-6xl mb-6">ðŸ“Š</div>
            <h2 className="text-2xl font-light text-white mb-4">
              Dados Insuficientes para AnÃ¡lise
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Para gerar insights inteligentes e anÃ¡lises avanÃ§adas, precisamos de mais dados financeiros. 
              Adicione mais transaÃ§Ãµes ao seu histÃ³rico para comeÃ§ar a ver anÃ¡lises personalizadas.
            </p>
            
            {/* Requisitos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="text-2xl mb-2">ðŸ”®</div>
                <h3 className="text-white font-medium mb-1">AnÃ¡lise Preditiva</h3>
                <p className="text-white/60 text-sm">Precisa de 3+ meses de dados</p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="text-2xl mb-2">ðŸ†</div>
                <h3 className="text-white font-medium mb-1">Score Financeiro</h3>
                <p className="text-white/60 text-sm">Precisa de 6+ meses de dados</p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="text-2xl mb-2">ðŸ§ </div>
                <h3 className="text-white font-medium mb-1">Insights Inteligentes</h3>
                <p className="text-white/60 text-sm">Precisa de transaÃ§Ãµes recentes</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                onClick={() => window.location.href = '/dashboard/transactions'}
              >
                Adicionar TransaÃ§Ãµes
              </button>
              <p className="text-white/40 text-sm">
                Ou conecte uma conta bancÃ¡ria para importar automaticamente
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-black">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-light text-white mb-3">
              Insights AvanÃ§ados
            </h1>
            <p className="text-white/60 text-lg">
              AnÃ¡lises inteligentes e projeÃ§Ãµes para suas finanÃ§as
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <PeriodSelector 
              currentFilter={currentFilter}
              onPeriodChange={handlePeriodChange}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Financial Score */}
        {financialScore && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FinancialScoreCard score={financialScore} />
          </motion.div>
        )}

        {/* Predictive Analysis */}
        {predictiveData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PredictiveAnalysisCard 
              analysis={predictiveData} 
              loading={isLoading} 
            />
          </motion.div>
        )}
      </div>

      {/* Smart Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SmartInsightsGrid insights={smartInsights} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-white">AÃ§Ãµes Recomendadas</h2>
          <div className="text-2xl">âš¡</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">ðŸ“Š</div>
              <h3 className="text-white font-medium">Criar OrÃ§amento</h3>
            </div>
            <p className="text-white/60 text-sm">
              Defina limites de gastos baseados na sua anÃ¡lise
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">ðŸŽ¯</div>
              <h3 className="text-white font-medium">Definir Metas</h3>
            </div>
            <p className="text-white/60 text-sm">
              EstabeleÃ§a objetivos financeiros inteligentes
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">ðŸ””</div>
              <h3 className="text-white font-medium">Alertas</h3>
            </div>
            <p className="text-white/60 text-sm">
              Configure notificaÃ§Ãµes personalizadas
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">ðŸ“ˆ</div>
              <h3 className="text-white font-medium">RelatÃ³rio</h3>
            </div>
            <p className="text-white/60 text-sm">
              Gere relatÃ³rio detalhado de insights
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/[0.05] rounded-xl p-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-2xl">ðŸ¤–</span>
            <h3 className="text-white font-medium">Powered by AI</h3>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mx-auto">
            Nossos insights sÃ£o gerados por inteligÃªncia artificial que analisa seus padrÃµes de gastos, 
            identifica tendÃªncias e faz previsÃµes personalizadas para ajudar vocÃª a tomar melhores decisÃµes financeiras.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 
