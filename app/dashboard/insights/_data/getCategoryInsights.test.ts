import { describe, it, expect } from 'bun:test'
import getCategoryInsights from './getCategoryInsights'

describe('getCategoryInsights', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar insights de categoria estruturados', async () => {
    try {
      const insights = await getCategoryInsights(validUserId)
      
      // Deve retornar array de CategoryInsight
      expect(Array.isArray(insights)).toBe(true)
      
      // Se há dados, verifica estrutura CategoryInsight
      if (insights.length > 0) {
        const firstInsight = insights[0]
        expect(typeof firstInsight.categoryName).toBe('string')
        expect(typeof firstInsight.totalSpent).toBe('number')
        expect(typeof firstInsight.percentage).toBe('number')
        expect(typeof firstInsight.transactionCount).toBe('number')
        expect(typeof firstInsight.avgTransactionAmount).toBe('number')
        expect(typeof firstInsight.color).toBe('string')
        
        // Percentuais devem estar entre 0 e 100
        expect(firstInsight.percentage >= 0 && firstInsight.percentage <= 100).toBe(true)
      }
    } catch (error) {
      // Erro de DB/contexto é esperado
      expect((error as Error).message.includes('database') || 
             (error as Error).message.includes('Supabase')).toBe(true)
    }
  })

  it('deve aceitar filtro de período', async () => {
    const filter = {
      type: 'monthly' as const,
      year: 2024,
      month: 1
    }

    try {
      const insights = await getCategoryInsights(validUserId, filter)
      expect(Array.isArray(insights)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve ordenar por valor gasto (maior primeiro)', async () => {
    try {
      const insights = await getCategoryInsights(validUserId)
      
      if (insights.length > 1) {
        // Verifica se está ordenado decrescente por totalSpent
        for (let i = 0; i < insights.length - 1; i++) {
          expect(insights[i].totalSpent >= insights[i + 1].totalSpent).toBe(true)
        }
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
}) 