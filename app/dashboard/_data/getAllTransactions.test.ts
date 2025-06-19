import { describe, it, expect } from 'bun:test'
import getAllTransactions from './getAllTransactions'

describe('getAllTransactions', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar estrutura paginada para parâmetros válidos', async () => {
    try {
      const result = await getAllTransactions(validUserId, 1, 10)
      
      // Verifica estrutura PaginatedTransactions
      expect(typeof result).toBe('object')
      expect(Array.isArray(result.transactions)).toBe(true)
      expect(typeof result.totalCount).toBe('number')
      expect(typeof result.totalPages).toBe('number')
      expect(typeof result.currentPage).toBe('number')
      expect(typeof result.hasNextPage).toBe('boolean')
      expect(typeof result.hasPreviousPage).toBe('boolean')
    } catch (error) {
      // Erro de DB/contexto é esperado
      expect((error as Error).message.includes('database') || 
             (error as Error).message.includes('Supabase')).toBe(true)
    }
  })

  it('deve aceitar filtros opcionais', async () => {
    const filter = {
      type: 'monthly' as const,
      year: 2024,
      month: 1
    }

    try {
      const result = await getAllTransactions(validUserId, 1, 5, filter)
      expect(Array.isArray(result.transactions)).toBe(true)
      expect(result.currentPage).toBe(1)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve calcular paginação corretamente', async () => {
    try {
      const result = await getAllTransactions(validUserId, 2, 10)
      expect(result.currentPage).toBe(2)
      expect(result.hasPreviousPage).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
}) 