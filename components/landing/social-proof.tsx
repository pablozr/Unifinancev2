'use client'

import { motion } from 'framer-motion'
import { Star, Quote, TrendingUp, Shield, Users, Award } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Chief Financial Officer',
    company: 'TechCorp Global',
    content: 'UniFinance revolucionou completamente nossas operações financeiras. Os insights de IA nos ajudaram a identificar economias de mais de $2M apenas no primeiro trimestre.',
    rating: 5,
    avatar: 'SC',
    impact: '$2M+ saved',
    category: 'Enterprise'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Finance Director',
    company: 'Global Ventures',
    content: 'As capacidades de análise em tempo real e previsão são revolucionárias. Agora podemos tomar decisões baseadas em dados com total confiança.',
    rating: 5,
    avatar: 'MR',
    impact: '40% faster decisions',
    category: 'Analytics'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Finance',
    company: 'Innovation Labs',
    content: 'Segurança era nossa principal preocupação, e o UniFinance superou todas as expectativas. A plataforma é poderosa e incrivelmente segura.',
    rating: 5,
    avatar: 'EW',
    impact: 'Zero breaches',
    category: 'Security'
  }
]

const stats = [
  { 
    value: '500+', 
    label: 'Clientes Enterprise',
    icon: Users,
    description: 'Empresas Fortune 500 confiam em nós'
  },
  { 
    value: '$50B+', 
    label: 'Ativos Gerenciados',
    icon: TrendingUp,
    description: 'Volume processado mensalmente'
  },
  { 
    value: '99.9%', 
    label: 'Uptime SLA',
    icon: Shield,
    description: 'Disponibilidade garantida'
  },
  { 
    value: '24/7', 
    label: 'Suporte Expert',
    icon: Award,
    description: 'Atendimento especializado'
  }
]

export default function SocialProof() {
  return (
    <section id="testimonials" className="relative py-32 bg-black overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Clean Black Background with White Details */}
      <div className="absolute inset-0">
        {/* Minimal grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px)
            `,
            backgroundSize: '150px 150px'
          }} />
        </div>
        
        {/* Geometric white details */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, white 2px, transparent 2px),
              radial-gradient(circle at 70% 20%, white 1px, transparent 1px),
              radial-gradient(circle at 80% 80%, white 1.5px, transparent 1.5px),
              radial-gradient(circle at 30% 70%, white 1px, transparent 1px)
            `,
            backgroundSize: '300px 300px, 200px 200px, 250px 250px, 180px 180px'
          }} />
        </div>
        
        {/* Clean geometric lines */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.025]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
            {/* Diagonal accent */}
            <path 
              d="M0,400 L1200,400" 
              stroke="white" 
              strokeWidth="0.5" 
              fill="none"
              opacity="0.1"
            />
            
            {/* Curved element */}
            <path 
              d="M-100,600 Q400,500 800,600 T1300,550" 
              stroke="white" 
              strokeWidth="1" 
              fill="none"
              opacity="0.06"
            />
          </svg>
        </div>
        
        {/* Subtle white glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-gradient-radial from-white/[0.008] to-transparent blur-2xl" />
        
        {/* Corner accents */}
        <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/[0.08] rounded-tl-2xl" />
        <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-white/[0.08] rounded-tr-2xl" />
        <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-white/[0.08] rounded-bl-2xl" />
        <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/[0.08] rounded-br-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Premium Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-xl mb-8"
            >
              <div className="w-2 h-2 bg-white/60 rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-white/80 tracking-wider uppercase">Números que Impressionam</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-extralight text-white mb-6 tracking-tighter">
              Resultados
              <br />
              <span className="bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent">
                Comprovados
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative h-full bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white/[0.15] group-hover:bg-gradient-to-br group-hover:from-white/[0.06] group-hover:via-white/[0.03] group-hover:to-white/[0.01] group-hover:scale-[1.02] group-hover:-translate-y-1">
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.02] border border-white/[0.08] flex items-center justify-center group-hover:scale-110 group-hover:border-white/[0.15] transition-all duration-600 ease-out">
                      <stat.icon className="w-8 h-8 text-white/80 group-hover:text-white/95 transition-colors duration-600" />
                      
                      {/* Icon glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out blur-sm" />
                    </div>
                  </div>
                  
                  {/* Value */}
                  <div className="text-5xl lg:text-6xl font-extralight text-white mb-3 group-hover:text-white/95 transition-colors duration-600">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="text-lg font-light text-white/70 mb-3 group-hover:text-white/85 transition-colors duration-600">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <div className="text-sm text-white/50 font-light group-hover:text-white/70 transition-colors duration-600">
                    {stat.description}
                  </div>
                  
                  {/* Subtle corner indicators */}
                  <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/[0.06] group-hover:border-white/[0.15] transition-colors duration-600 ease-out rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/[0.06] group-hover:border-white/[0.15] transition-colors duration-600 ease-out rounded-bl-lg" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-xl mb-8">
            <Quote className="w-4 h-4 text-white/60 mr-3" />
            <span className="text-sm font-medium text-white/80 tracking-wider uppercase">Depoimentos</span>
          </div>
          
          <h2 className="text-6xl md:text-7xl font-extralight text-white mb-8 tracking-tighter">
            Confiança de
            <br />
            <span className="bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent">
              Líderes da Indústria
            </span>
          </h2>
          
          <p className="text-2xl text-white/50 max-w-4xl mx-auto leading-relaxed font-extralight">
            Veja o que profissionais de finanças estão dizendo sobre como o UniFinance 
            <br className="hidden md:block" />
            está transformando suas operações.
          </p>
        </motion.div>

        {/* Luxury Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 60, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true }}
              className="group relative cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div className="relative h-full bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-white/[0.15] group-hover:bg-gradient-to-br group-hover:from-white/[0.06] group-hover:via-white/[0.03] group-hover:to-white/[0.01] group-hover:scale-[1.02] group-hover:-translate-y-1">
                
                {/* Category badge */}
                <div className="absolute top-6 right-6">
                  <div className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] backdrop-blur-sm">
                    <span className="text-xs font-medium text-white/70">{testimonial.category}</span>
                  </div>
                </div>
                
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-white/20 group-hover:text-white/30 transition-colors duration-600" />
                </div>
                
                {/* Rating */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400/80 fill-current mr-1 group-hover:text-yellow-400 transition-colors duration-600" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-white/80 mb-8 leading-relaxed text-lg font-light group-hover:text-white/90 transition-colors duration-600">
                  "{testimonial.content}"
                </p>

                {/* Impact metric */}
                <div className="mb-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-white/[0.1] to-white/[0.05] border border-white/[0.1] backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4 text-white/60 mr-2" />
                    <span className="text-sm font-medium text-white/80">{testimonial.impact}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-white/[0.03] border border-white/[0.1] flex items-center justify-center mr-4 group-hover:scale-105 group-hover:border-white/[0.2] transition-all duration-600">
                    <span className="text-white/90 font-semibold text-lg">
                      {testimonial.avatar}
                    </span>
                    
                    {/* Avatar glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-600 ease-out blur-sm" />
                  </div>
                  <div>
                    <div className="text-white/95 font-semibold text-lg group-hover:text-white transition-colors duration-600">
                      {testimonial.name}
                    </div>
                    <div className="text-white/60 text-sm font-light group-hover:text-white/75 transition-colors duration-600">
                      {testimonial.role}
                    </div>
                    <div className="text-white/40 text-sm font-light group-hover:text-white/60 transition-colors duration-600">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
                
                {/* Subtle corner indicators */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/[0.06] group-hover:border-white/[0.15] transition-colors duration-600 ease-out rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/[0.06] group-hover:border-white/[0.15] transition-colors duration-600 ease-out rounded-br-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
