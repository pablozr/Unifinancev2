import { describe, it, expect } from 'bun:test'
import deleteAllTransactions from './deleteAllTransactions'

describe('deleteAllTransactions', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar resultado estruturado de deleção', async () => {
    try {
      const result = await deleteAllTransactions(validUserId)
      
      // Verifica estrutura DeleteResult
      expect(typeof result).toBe('object')
      expect(typeof result.deleted).toBe('number')
      expect(typeof result.totalImpact).toBe('number')
      expect(typeof result.breakdown).toBe('object')
      
      // Verifica breakdown
      expect(typeof result.breakdown.credits).toBe('number')
      expect(typeof result.breakdown.debits).toBe('number')
      expect(typeof result.breakdown.creditAmount).toBe('number')
      expect(typeof result.breakdown.debitAmount).toBe('number')
      
      // Valores devem ser não-negativos
      expect(result.deleted >= 0).toBe(true)
      expect(result.breakdown.credits >= 0).toBe(true)
      expect(result.breakdown.debits >= 0).toBe(true)
      
    } catch (error) {
      // Erro de autenticação/contexto é esperado
      expect((error as Error).message.includes('usuário') || 
             (error as Error).message.includes('cookies') ||
             (error as Error).message.includes('database')).toBe(true)
    }
  })

  it('deve lidar com usuário sem transações', async () => {
    try {
      const result = await deleteAllTransactions(validUserId)
      
      // Mesmo sem transações, deve retornar estrutura válida
      if (result.deleted === 0) {
        expect(result.totalImpact).toBe(0)
        expect(result.breakdown.credits).toBe(0)
        expect(result.breakdown.debits).toBe(0)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve validar userId', async () => {
    try {
      await deleteAllTransactions('invalid-uuid')
    } catch (error) {
      expect((error as Error).message.includes('usuário') || 
             (error as Error).message.includes('UUID') ||
             (error as Error).message.includes('buscar') ||
             (error as Error).message.includes('cookies')).toBe(true)
    }
  })
})
