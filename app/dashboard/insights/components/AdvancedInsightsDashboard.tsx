'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChartBarIcon, CrystalBallIcon, TrophyIcon, BrainIcon, TargetIcon, BellIcon, TrendingUpIcon, BotIcon } from '@/components/icons'
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
                Insights Avançados
              </h1>
              <p className="text-white/60 text-lg">
                Análises inteligentes e projeções para suas finanças
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
            <div className="mb-6">
              <ChartBarIcon size={72} className="text-blue-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-light text-white mb-4">
              Dados Insuficientes para Análise
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Para gerar insights inteligentes e análises avançadas, precisamos de mais dados financeiros. 
              Adicione mais transações ao seu histórico para começar a ver análises personalizadas.
            </p>
            
            {/* Requisitos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="mb-2">
                  <CrystalBallIcon size={32} className="text-purple-400 mx-auto" />
                </div>
                <h3 className="text-white font-medium mb-1">Análise Preditiva</h3>
                <p className="text-white/60 text-sm">Precisa de 3+ meses de dados</p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="mb-2">
                  <TrophyIcon size={32} className="text-yellow-400 mx-auto" />
                </div>
                <h3 className="text-white font-medium mb-1">Score Financeiro</h3>
                <p className="text-white/60 text-sm">Precisa de 6+ meses de dados</p>
              </div>
              
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="mb-2">
                  <BrainIcon size={32} className="text-pink-400 mx-auto" />
                </div>
                <h3 className="text-white font-medium mb-1">Insights Inteligentes</h3>
                <p className="text-white/60 text-sm">Precisa de transações recentes</p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="space-y-4">
              <button 
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                onClick={() => window.location.href = '/dashboard'}
              >
                Adicionar Transações
              </button>
              <p className="text-white/40 text-sm">
                Ou conecte uma conta bancária para importar automaticamente
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
              Insights Avançados
            </h1>
            <p className="text-white/60 text-lg">
              Análises inteligentes e projeções para suas finanças
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
          <h2 className="text-2xl font-light text-white">Ações Recomendadas</h2>
          <BrainIcon size={28} className="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <ChartBarIcon size={32} className="text-blue-400" />
              <h3 className="text-white font-medium">Criar Orçamento</h3>
            </div>
            <p className="text-white/60 text-sm">
              Defina limites de gastos baseados na sua análise
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <TargetIcon size={32} className="text-green-400" />
              <h3 className="text-white font-medium">Definir Metas</h3>
            </div>
            <p className="text-white/60 text-sm">
              Estabeleça objetivos financeiros inteligentes
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <BellIcon size={32} className="text-yellow-400" />
              <h3 className="text-white font-medium">Alertas</h3>
            </div>
            <p className="text-white/60 text-sm">
              Configure notificações personalizadas
            </p>
          </div>

          <div className="group bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <ChartBarIcon size={32} className="text-purple-400" />
              <h3 className="text-white font-medium">Relatório</h3>
            </div>
            <p className="text-white/60 text-sm">
              Gere relatório detalhado de insights
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
            <BotIcon size={32} className="text-blue-400" />
            <h3 className="text-white font-medium">Powered by AI</h3>
          </div>
          <p className="text-white/60 text-sm max-w-2xl mx-auto">
            Nossos insights são gerados por inteligência artificial que analisa seus padrões de gastos, 
            identifica tendências e faz previsões personalizadas para ajudar você a tomar melhores decisões financeiras.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 

