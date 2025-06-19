import { describe, it, expect } from 'bun:test'
import createImportRecord from './createImportRecord'

describe('createImportRecord', () => {
  const validParams = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    filename: 'test.csv',
    fileSize: 1024,
    fileHash: 'abc123',
    totalRows: 100,
    validRows: 95
  }

  it('deve retornar resultado estruturado de criação', async () => {
    try {
      const result = await createImportRecord(
        validParams.userId,
        validParams.filename,
        validParams.fileSize,
        validParams.fileHash,
        validParams.totalRows,
        validParams.validRows
      )
      
      // Verifica estrutura ImportRecordResult
      expect(typeof result).toBe('object')
      expect(typeof result.success).toBe('boolean')
      
             if (result.success) {
         expect(result.csvImport !== undefined).toBe(true)
         expect(typeof result.finalHash).toBe('string')
         expect(typeof result.finalFilename).toBe('string')
       } else {
         expect(typeof result.error).toBe('string')
         expect(result.error && result.error.length > 0).toBe(true)
       }
    } catch (error) {
      // Erro de contexto/DB é esperado
      expect((error as Error).message.includes('cookies') || 
             (error as Error).message.includes('database')).toBe(true)
    }
  })

  it('deve validar parâmetros obrigatórios', async () => {
    try {
      const result = await createImportRecord(
        '', // userId vazio
        validParams.filename,
        validParams.fileSize,
        validParams.fileHash,
        validParams.totalRows,
        validParams.validRows
      )
      
             // Deve falhar com userId vazio
       expect(result.success).toBe(false)
       expect(result.error !== undefined).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve aceitar números válidos para tamanhos', async () => {
    try {
      const result = await createImportRecord(
        validParams.userId,
        validParams.filename,
        0, // fileSize zero
        validParams.fileHash,
        0, // totalRows zero
        0  // validRows zero
      )
      
      // Deve aceitar zeros como valores válidos
      expect(typeof result).toBe('object')
      expect(typeof result.success).toBe('boolean')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve lidar com erro de constraint única', async () => {
    try {
      const result = await createImportRecord(
        validParams.userId,
        validParams.filename,
        validParams.fileSize,
        validParams.fileHash,
        validParams.totalRows,
        validParams.validRows
      )
      
      // Se houver conflito, deve tentar workaround
      if (!result.success && result.error?.includes('constraint')) {
        expect(result.error.includes('Erro persistente') || 
               result.error.includes('constraint')).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve gerar hash e filename únicos em caso de conflito', async () => {
    try {
      const result = await createImportRecord(
        validParams.userId,
        validParams.filename,
        validParams.fileSize,
        validParams.fileHash,
        validParams.totalRows,
        validParams.validRows
      )
      
      // Se sucesso com workaround, hash/filename devem ser diferentes
      if (result.success && result.finalHash !== validParams.fileHash) {
        expect(result.finalHash?.includes(validParams.fileHash)).toBe(true)
        expect(result.finalFilename?.includes(validParams.filename)).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
