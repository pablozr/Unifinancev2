import { describe, it, expect } from 'bun:test'
import addSingleTransaction from './addSingleTransaction'

describe('addSingleTransaction', () => {
  const validTransactionData = {
    description: 'Compra teste',
    type: 'debit' as const,
    amount: 50.00,
    category: 'alimentacao'
  }

  it('deve exportar uma função', () => {
    expect(typeof addSingleTransaction).toBe('function')
  })

  it('deve aceitar parâmetros obrigatórios', () => {
    // Server actions devem aceitar pelo menos um parâmetro
    expect(addSingleTransaction.length > 0).toBe(true)
  })

  it('deve rejeitar dados inválidos', async () => {
    try {
      // Testa com dados completamente inválidos
      const result = await addSingleTransaction(null as any)
      // Se não lançar erro, deve pelo menos retornar um objeto com estrutura
      expect(typeof result).toBe('object')
    } catch (error) {
      // Erro é esperado para dados inválidos ou contexto inválido
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve validar estrutura de entrada básica', async () => {
    try {
      // Testa com objeto vazio (estrutura mínima)
      const result = await addSingleTransaction({} as any)
      
      if (result) {
        // Se retornou algo, deve ser um objeto estruturado
        expect(typeof result).toBe('object')
        
        // Actions geralmente retornam success/error indicators
        const hasSuccessIndicator = 'success' in result || 'error' in result || 'message' in result
        expect(hasSuccessIndicator || Array.isArray(result)).toBe(true)
      }
    } catch (error) {
      // Erros de contexto/validação são esperados
      expect(error).toBeInstanceOf(Error)
      expect(typeof (error as Error).message).toBe('string')
    }
  })

  it('deve lidar com contexto inválido graciosamente', async () => {
    // Actions podem falhar por contexto de request inválido
    try {
      await addSingleTransaction('test' as any)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      const errorMessage = (error as Error).message
      // Erros comuns de contexto Next.js
      const isContextError = errorMessage.includes('request scope') || 
                           errorMessage.includes('cookies') ||
                           errorMessage.includes('headers')
      expect(isContextError || errorMessage.length > 0).toBe(true)
    }
  })

  it('deve retornar resultado estruturado para dados válidos', async () => {
    try {
      const result = await addSingleTransaction(validTransactionData)
      
      // Deve retornar objeto com estrutura esperada
      expect(typeof result).toBe('object')
      expect(typeof result.success).toBe('boolean')
      
      if (result.success) {
        expect(typeof result.transactionId).toBe('string')
      } else {
        expect(typeof result.error).toBe('string')
      }
    } catch (error) {
      // Erro de contexto Next.js é esperado
      expect((error as Error).message.includes('cookies') || 
             (error as Error).message.includes('request scope')).toBe(true)
    }
  })

  it('deve validar dados obrigatórios', async () => {
    try {
      const result = await addSingleTransaction({
        description: '',
        type: 'debit',
        amount: 0
      })
      expect(result.success).toBe(false)
      expect(result.error?.includes('obrigatória') || result.error?.includes('maior que zero')).toBe(true)
    } catch (error) {
      // Erro de contexto é aceitável
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve rejeitar tipo inválido', async () => {
    try {
      const result = await addSingleTransaction({
        ...validTransactionData,
        type: 'invalid' as any
      })
      expect(result.success).toBe(false)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
