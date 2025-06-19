'use client'

import { useState, useRef } from 'react'
import uploadAndProcess, { UploadResult } from '../_actions/uploadAndProcess'
import { Button } from '@/components/ui/button'

interface UploadFormProps {
  onSuccess: (result: UploadResult) => void
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadAndProcess(formData)
      
      if (result.success) {
        onSuccess(result)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        setError(result.error || 'Erro desconhecido')
      }
    } catch (err) {
      setError('Erro ao processar arquivo')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const formData = new FormData()
        formData.append('file', file)
        handleSubmit(formData)
      } else {
        setError('Apenas arquivos CSV sÃ£o permitidos')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData()
      formData.append('file', e.target.files[0])
      handleSubmit(formData)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-white mb-2">
            Importar Extrato BancÃ¡rio
          </h2>
          <p className="text-white/60 text-sm">
            FaÃ§a upload do seu arquivo CSV para anÃ¡lise automÃ¡tica
          </p>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-blue-400 bg-blue-400/5'
              : 'border-white/20 hover:border-white/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-white/[0.05] rounded-2xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-white font-medium mb-1">
                {isUploading ? 'Processando arquivo...' : 'Arraste seu arquivo CSV aqui'}
              </p>
              <p className="text-white/60 text-sm">
                ou clique para selecionar
              </p>
            </div>

            <div className="text-xs text-white/40">
              Formatos aceitos: CSV â€¢ Tamanho mÃ¡ximo: 10MB
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-white px-6 py-3 rounded-2xl transition-all duration-300"
          >
            {isUploading ? 'Processando...' : 'Selecionar Arquivo'}
          </Button>
        </div>

        <div className="mt-8 p-4 bg-white/[0.02] rounded-2xl">
          <h3 className="text-white font-medium mb-3 text-sm">
            ðŸ“‹ Formatos aceitos (muito flexÃ­vel):
          </h3>
          <div className="text-xs text-white/60 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="font-medium text-white/80 mb-1">Colunas de Data:</div>
                <div>date, data, dt, fecha, datum</div>
              </div>
              <div>
                <div className="font-medium text-white/80 mb-1">Colunas de Valor:</div>
                <div>amount, valor, value, val, quantia</div>
              </div>
              <div>
                <div className="font-medium text-white/80 mb-1">Colunas de DescriÃ§Ã£o:</div>
                <div>description, descricao, desc, historico</div>
              </div>
              <div>
                <div className="font-medium text-white/80 mb-1">Colunas de Tipo:</div>
                <div>type, tipo, category, categoria</div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/[0.05]">
              <div className="font-medium text-white/80 mb-2">ðŸ’° Formatos de valor aceitos:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>â€¢ R$ 1.234,56</div>
                <div>â€¢ $1,234.56</div>
                <div>â€¢ 1234.56</div>
                <div>â€¢ -150,50 (dÃ©bito automÃ¡tico)</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <div className="font-medium text-white/80 mb-2">ðŸ”„ Separadores aceitos:</div>
              <div>VÃ­rgula (,) ou ponto-e-vÃ­rgula (;)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
