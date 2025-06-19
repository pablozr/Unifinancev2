'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navigation() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">U</span>
            </div>
            <span className="text-white font-semibold text-xl">UniFinance</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Features
            </Link>
            <Link 
              href="#testimonials" 
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Testimonials
            </Link>
            <Link 
              href="/login" 
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Link 
              href="/login" 
              className="text-white/70 hover:text-white transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
