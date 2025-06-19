export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileBuffer?: ArrayBuffer
  fileHash?: string
}

export default async function validateFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { isValid: false, error: 'Nenhum arquivo selecionado' }
  }

  if (!file.name.endsWith('.csv')) {
    return { isValid: false, error: 'Apenas arquivos CSV são permitidos' }
  }

  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Arquivo muito grande. Máximo 10MB permitido' }
  }

  const fileBuffer = await file.arrayBuffer()
  const crypto = await import('crypto')
  const fileHash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex')

  return {
    isValid: true,
    fileBuffer,
    fileHash
  }
} 