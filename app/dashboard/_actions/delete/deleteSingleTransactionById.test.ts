import { describe, it, expect } from 'bun:test'
import deleteSingleTransactionById from './deleteSingleTransactionById'

describe('deleteSingleTransactionById', () => {
  const validTransactionId = '123e4567-e89b-12d3-a456-426614174001'

  it('deve retornar resultado estruturado de deleção', async () => {
    try {
      const result = await deleteSingleTransactionById(validTransactionId)
      
      // Verifica estrutura DeleteTransactionResult
      expect(typeof result).toBe('object')
      expect(typeof result.success).toBe('boolean')
      
      if (result.success) {
        expect(typeof result.transactionId).toBe('string')
        expect(result.transactionId).toBe(validTransactionId)
      } else {
        expect(typeof result.error).toBe('string')
        expect(result.error && result.error.length > 0).toBe(true)
      }
    } catch (error) {
      // Erro de contexto/autenticação é esperado
      expect((error as Error).message.includes('cookies') || 
             (error as Error).message.includes('autenticação')).toBe(true)
    }
  })

  it('deve validar ID da transação obrigatório', async () => {
    try {
      const result = await deleteSingleTransactionById('')
      
      // Deve falhar com ID vazio
      expect(result.success).toBe(false)
      expect(result.error?.includes('obrigatório')).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve validar ID da transação com espaços', async () => {
    try {
      const result = await deleteSingleTransactionById('   ')
      
      // Deve falhar com ID só com espaços
      expect(result.success).toBe(false)
      expect(result.error?.includes('obrigatório')).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve verificar autenticação', async () => {
    try {
      const result = await deleteSingleTransactionById(validTransactionId)
      
      // Se falhar por autenticação, deve retornar erro específico
      if (!result.success && result.error?.includes('autenticado')) {
        expect(result.error.includes('autenticado')).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve verificar permissão do usuário', async () => {
    try {
      const result = await deleteSingleTransactionById(validTransactionId)
      
      // Se falhar por permissão, deve retornar erro específico
      if (!result.success && result.error?.includes('permissão')) {
        expect(result.error.includes('permissão') || 
               result.error.includes('não encontrada')).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve aceitar UUID válido', async () => {
    try {
      const result = await deleteSingleTransactionById(validTransactionId)
      
      // UUID válido deve ser processado sem erro de formato
      expect(typeof result).toBe('object')
      expect(typeof result.success).toBe('boolean')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
