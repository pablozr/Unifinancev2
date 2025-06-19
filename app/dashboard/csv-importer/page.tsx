'use client'

import { useState } from 'react'
import UploadForm from './components/UploadForm'
import ResultsView from './components/ResultsView'
import { UploadResult } from './_actions/uploadAndProcess'

export default function CSVImporterPage() {
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleSuccess = (uploadResult: UploadResult) => {
    setResult(uploadResult)
  }

  const handleNewUpload = () => {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extralight text-white mb-4">
            Importador de <span className="font-light">Extratos</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Transforme seus extratos bancários em insights financeiros poderosos. 
            Upload, processamento e análise automática em segundos.
          </p>
        </div>

        {!result ? (
          <UploadForm onSuccess={handleSuccess} />
        ) : (
          <ResultsView result={result} onNewUpload={handleNewUpload} />
        )}

        {/* Features Info */}
        {!result && (
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Validação Automática</h3>
                <p className="text-white/60 text-sm">
                  Verificação inteligente de dados com suporte a múltiplos formatos de data
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Processamento Rápido</h3>
                <p className="text-white/60 text-sm">
                  Análise instantânea com categorização e agregação mensal automática
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Insights Visuais</h3>
                <p className="text-white/60 text-sm">
                  Relatórios detalhados com visualizações claras de receitas e despesas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 