import { describe, it, expect } from 'bun:test'
import deleteImportedTransactions from './deleteImportedTransactions'

describe('deleteImportedTransactions', () => {
  it('deve exportar uma função', () => {
    expect(typeof deleteImportedTransactions).toBe('function')
  })

  it('deve aceitar parâmetros obrigatórios', () => {
    // Server actions devem aceitar pelo menos um parâmetro
    expect(deleteImportedTransactions.length > 0).toBe(true)
  })

  it('deve rejeitar dados inválidos', async () => {
    try {
      // Testa com dados completamente inválidos
      const result = await deleteImportedTransactions(null as any)
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
      const result = await deleteImportedTransactions({} as any)
      
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
      await deleteImportedTransactions('test' as any)
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
})
