'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/currency'
import type { SmartInsight } from '../_data'

interface SmartInsightsGridProps {
  insights: SmartInsight[]
}

export function SmartInsightsGrid({ insights }: SmartInsightsGridProps) {
  const getInsightColor = (type: string, impact: string) => {
    switch (type) {
      case 'alert':
        return impact === 'high' ? 'border-red-500/30 bg-red-500/5' : 'border-orange-500/30 bg-orange-500/5'
      case 'opportunity':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'pattern':
        return 'border-purple-500/30 bg-purple-500/5'
      case 'achievement':
        return 'border-green-500/30 bg-green-500/5'
      default:
        return 'border-white/10 bg-white/[0.02]'
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">Alto</span>
      case 'medium':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">Médio</span>
      case 'low':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">Baixo</span>
      default:
        return null
    }
  }

  if (insights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center"
      >
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-xl font-medium text-white mb-2">Nenhum insight disponível</h3>
        <p className="text-white/60">
          Adicione mais transações para gerar insights personalizados
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white">Insights Inteligentes</h2>
        <div className="text-2xl">🧠</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`backdrop-blur-xl border rounded-xl p-4 relative overflow-hidden ${getInsightColor(insight.type, insight.impact)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{insight.icon}</span>
                <span className="text-white font-medium text-sm">{insight.title}</span>
              </div>
              {getImpactBadge(insight.impact)}
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm mb-3 leading-relaxed">
              {insight.description}
            </p>

            {/* Value */}
            {insight.value && (
              <div className="mb-3">
                <span className="text-white text-lg font-light">
                  {formatCurrency(insight.value)}
                </span>
                {insight.category && (
                  <span className="text-white/60 text-xs ml-2">
                    em {insight.category}
                  </span>
                )}
              </div>
            )}

            {/* Suggestion */}
            {insight.suggestion && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 mt-3">
                <div className="flex items-start space-x-2">
                  <span className="text-sm mt-0.5">💡</span>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {insight.suggestion}
                  </p>
                </div>
              </div>
            )}

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: insights.length * 0.1 + 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
      >
        {['alert', 'opportunity', 'pattern', 'achievement'].map((type) => {
          const count = insights.filter(i => i.type === type).length
          const icons = {
            alert: '⚠️',
            opportunity: '💡',
            pattern: '🔄',
            achievement: '🎉'
          }
          const labels = {
            alert: 'Alertas',
            opportunity: 'Oportunidades',
            pattern: 'Padrões',
            achievement: 'Conquistas'
          }
          
          return (
            <div key={type} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{icons[type as keyof typeof icons]}</div>
              <div className="text-white text-lg font-light">{count}</div>
              <div className="text-white/60 text-xs">{labels[type as keyof typeof labels]}</div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
} 