'use client'

import { useState, useRef } from 'react'
import uploadAndProcess, { UploadResult } from '../_actions/uploadAndProcess'
import { Button } from '@/components/ui/button'

interface UploadFormProps {
  onSuccess: (result: UploadResult) => void
  className?: string
}

export default function UploadForm({ onSuccess, className = '' }: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        setError(result.error || 'Erro no upload')
      }
    } catch (err) {
      setError('Erro inesperado no upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <form action={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-600/50 bg-gray-800/30 rounded-xl p-6 text-center hover:border-gray-500/50 hover:bg-gray-800/50 transition-all duration-200">
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept=".csv"
            required
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:transition-colors"
          />
          <p className="mt-2 text-sm text-gray-400">
            Selecione um arquivo CSV (máximo 10MB)
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-600/20 border border-red-500/30 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl py-3 transition-all duration-200 disabled:opacity-50"
        >
          {isUploading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            'Fazer Upload'
          )}
        </Button>
      </form>
    </div>
  )
} 