'use client'

import { motion } from 'framer-motion'
import type { FinancialScore } from '../_data'

interface FinancialScoreCardProps {
  score: FinancialScore
}

export function FinancialScoreCard({ score }: FinancialScoreCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-400'
      case 'B': return 'text-blue-400'
      case 'C': return 'text-yellow-400'
      case 'D': return 'text-orange-400'
      case 'F': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600'
    if (score >= 70) return 'from-blue-500 to-cyan-600'
    if (score >= 55) return 'from-yellow-500 to-amber-600'
    if (score >= 40) return 'from-orange-500 to-red-600'
    return 'from-red-500 to-red-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-white">Score de Saúde Financeira</h3>
          <div className="text-2xl">🏆</div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/10"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray={`${score.overallScore}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`stop-color-${getScoreColor(score.overallScore).split(' ')[0].replace('from-', '')}`} />
                  <stop offset="100%" className={`stop-color-${getScoreColor(score.overallScore).split(' ')[1].replace('to-', '')}`} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Score Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-light text-white mb-1">
                  {score.overallScore}
                </div>
                <div className={`text-xl font-medium ${getGradeColor(score.grade)}`}>
                  {score.grade}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Taxa de Poupança</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, score.savingsRate)}%` }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium">
                {score.savingsRate.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Estabilidade</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-500"
                  style={{ width: `${score.expenseStability}%` }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium">
                {score.expenseStability.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Diversificação</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                  style={{ width: `${score.categoryDiversification}%` }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium">
                {score.categoryDiversification.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Consistência</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500"
                  style={{ width: `${score.incomeConsistency}%` }}
                ></div>
              </div>
              <span className="text-white text-sm font-medium">
                {score.incomeConsistency.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {score.strengths.length > 0 && (
            <div>
              <h4 className="text-green-400 text-sm font-medium mb-2 flex items-center">
                <span className="mr-2">✅</span>
                Pontos Fortes
              </h4>
              <ul className="space-y-1">
                {score.strengths.slice(0, 3).map((strength, index) => (
                  <li key={index} className="text-white/60 text-sm">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.weaknesses.length > 0 && (
            <div>
              <h4 className="text-red-400 text-sm font-medium mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Pontos de Melhoria
              </h4>
              <ul className="space-y-1">
                {score.weaknesses.slice(0, 3).map((weakness, index) => (
                  <li key={index} className="text-white/60 text-sm">
                    • {weakness}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Top Recommendation */}
        {score.recommendations.length > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
            <h4 className="text-blue-400 text-sm font-medium mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Recomendação Principal
            </h4>
            <p className="text-white/80 text-sm">
              {score.recommendations[0]}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 