'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Shield, 
  Zap, 
  TrendingUp,
  Lock,
  Brain,
  Gauge,
  Users
} from 'lucide-react'
import Beams from '@/components/ui/Beams/Beams'
import PixelCard from '@/components/ui/PixelCard/PixelCard'

const features = [
  {
    icon: Brain,
    title: 'IA Analytics',
    description: 'Análise inteligente de dados financeiros com machine learning avançado para insights precisos e previsões de mercado.',
    metrics: '99.7% accuracy',
    benefit: 'Reduce analysis time by 85%',
    variant: 'blue' as const
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Proteção de nível bancário com criptografia AES-256, autenticação multi-fator e compliance SOC 2 Type II.',
    metrics: 'Zero breaches',
    benefit: 'Bank-level security',
    variant: 'default' as const
  },
  {
    icon: Zap,
    title: 'Performance',
    description: 'Processamento ultra-rápido com latência sub-milissegundo e arquitetura distribuída para máxima eficiência.',
    metrics: '<1ms latency',
    benefit: '10x faster processing',
    variant: 'yellow' as const
  },
  {
    icon: TrendingUp,
    title: 'Growth',
    description: 'Ferramentas avançadas de crescimento com análise preditiva e otimização automática de estratégias financeiras.',
    metrics: '94% accuracy',
    benefit: 'Boost ROI by 40%',
    variant: 'pink' as const
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Beams Background - Testando diferentes configurações */}
      <div className="absolute inset-0 w-full h-full">
        <Beams 
          beamWidth={2.5}
          beamHeight={25}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2.2}
          noiseIntensity={1.8}
          scale={0.25}
          rotation={15}
        />
      </div>
      
      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50" />
     
     <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2 
            className="text-7xl lg:text-8xl font-extralight text-white mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            Recursos
            <span className="block text-6xl lg:text-7xl text-white/60 mt-2">
              Avançados
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            Tecnologia de ponta que transforma dados em decisões inteligentes, 
            oferecendo segurança máxima e performance incomparável.
          </motion.p>
        </div>

        {/* Features Grid with PixelCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              viewport={{ once: true }}
            >
              <PixelCard 
                variant={feature.variant}
                className=""
              >
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between text-center">
                  {/* Background overlay for better text visibility */}
                  <div className="absolute inset-0 bg-black/50 rounded-[25px]" />
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-white/15 border border-white/30 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/90 text-sm leading-relaxed mb-6 drop-shadow-md">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Metrics & Benefits */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/25 border border-white/40 shadow-md">
                      <span className="text-xs font-semibold text-white drop-shadow-sm">
                        {feature.metrics}
                      </span>
                    </div>
                    
                    <div className="text-xs text-white/80 font-medium drop-shadow-sm">
                      {feature.benefit}
                    </div>
                  </div>
                  </div>
                </div>
              </PixelCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
