'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Canvas } from '@react-three/fiber'
  
import { Suspense } from 'react'
import { LayeredFinancialBackground } from '@/components/ui/Layer'
import LiquidChrome from '@/components/ui/LiquidChrome/LiquidChrome'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
      {/* LiquidChrome como fundo */}
      <div className="absolute inset-0 -z-30">
        <LiquidChrome baseColor={[0.15, 0.16, 0.18]} interactive={true} />
      </div>
    

      
      
      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Financial Intelligence
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Revolutionize your financial workflow with AI-powered insights, 
            seamless automation, and enterprise-grade security.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link 
              href="/login"
              className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              Start Free Trial
            </Link>
            <Link 
              href="#features"
              className="border border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-12">
            <p className="text-white/50 text-sm mb-6">Trusted by leading financial institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-white/40 font-semibold">Enterprise Ready</div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="text-white/40 font-semibold">SOC 2 Compliant</div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="text-white/40 font-semibold">99.9% Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
