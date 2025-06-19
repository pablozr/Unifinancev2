export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative" style={{ backgroundColor: '#000000' }}>
      {/* Premium Background */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(white 1px, transparent 1px),
              linear-gradient(90deg, white 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }} />
        </div>
        
        {/* Scattered white dots */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
              radial-gradient(circle at 75% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 25% 75%, white 1.5px, transparent 1.5px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
            backgroundSize: '200px 200px, 150px 150px, 180px 180px, 160px 160px'
          }} />
        </div>
        
        {/* Geometric lines */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.025]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
            <path 
              d="M0,400 L1200,400" 
              stroke="white" 
              strokeWidth="0.5" 
              fill="none"
              opacity="0.08"
            />
            <path 
              d="M600,0 L600,800" 
              stroke="white" 
              strokeWidth="0.5" 
              fill="none"
              opacity="0.05"
            />
          </svg>
        </div>
        
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-gradient-radial from-white/[0.008] to-transparent blur-2xl" />
        
        {/* Corner accents */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-white/[0.06] rounded-tl-2xl" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-white/[0.06] rounded-tr-2xl" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-white/[0.06] rounded-bl-2xl" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-white/[0.06] rounded-br-2xl" />
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Premium Card Container */}
        <div className="relative bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 overflow-hidden">
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/[0.06] via-transparent to-white/[0.06] opacity-50 blur-[0.5px]" />
          
          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.1] via-white/[0.05] to-white/[0.02] border border-white/[0.08] mb-6">
              <span className="text-white font-bold text-2xl">U</span>
            </div>
            <h1 className="text-3xl font-extralight text-white mb-2 tracking-tight">
              UniFinance
            </h1>
            <p className="text-white/50 text-sm font-light">
              Plataforma de Inteligência Financeira
            </p>
          </div>
          
          {/* Form Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Corner indicators */}
          <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/[0.06] rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/[0.06] rounded-bl-lg" />
        </div>
      </div>
    </div>
  )
}
