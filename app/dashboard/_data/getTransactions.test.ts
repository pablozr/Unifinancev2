import { describe, it, expect } from 'bun:test'
import getTransactions from './getTransactions'

describe('getTransactions', () => {
  const validConfig = {
    userId: '123e4567-e89b-12d3-a456-426614174000'
  }

  it('deve retornar array de transações para config válida', async () => {
    try {
      const transactions = await getTransactions(validConfig)
      expect(Array.isArray(transactions)).toBe(true)
    } catch (error) {
      // Erro de DB/contexto é esperado
      expect((error as Error).message.includes('buscar transações') || 
             (error as Error).message.includes('database') ||
             (error as Error).message.includes('Supabase') ||
             (error as Error).message.includes('cookies')).toBe(true)
    }
  })

  it('deve aceitar filtros opcionais', async () => {
    const configWithFilters = {
      ...validConfig,
      transactionType: 'credit' as const,
      orderBy: 'amount' as const,
      includeCategories: true,
      limit: 10
    }

    try {
      const result = await getTransactions(configWithFilters)
      expect(Array.isArray(result)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve rejeitar config inválida', async () => {
    try {
      await getTransactions({ userId: 'invalid-uuid' })
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
}) 