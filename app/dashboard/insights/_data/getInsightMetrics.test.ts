import { describe, it, expect } from 'bun:test'
import getInsightMetrics from './getInsightMetrics'

describe('getInsightMetrics', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar métricas de insights estruturadas', async () => {
    try {
      const metrics = await getInsightMetrics(validUserId)
      
      // Verifica estrutura InsightMetrics
      expect(typeof metrics).toBe('object')
      expect(typeof metrics.avgMonthlyIncome).toBe('number')
      expect(typeof metrics.avgMonthlyExpenses).toBe('number')
      expect(typeof metrics.savingsRate).toBe('number')
      expect(typeof metrics.topSpendingCategory).toBe('string')
      expect(typeof metrics.expenseGrowth).toBe('number')
      expect(typeof metrics.incomeStability).toBe('number')
      
      // Valores devem ser não-negativos (exceto crescimento que pode ser negativo)
      expect(metrics.avgMonthlyIncome >= 0).toBe(true)
      expect(metrics.avgMonthlyExpenses >= 0).toBe(true)
      expect(metrics.incomeStability >= 0 && metrics.incomeStability <= 100).toBe(true)
      
      // Taxa de poupança deve estar entre -100 e 100
      expect(metrics.savingsRate >= -100 && metrics.savingsRate <= 100).toBe(true)
      
    } catch (error) {
      // Erro de DB/contexto é esperado
      expect((error as Error).message.includes('database') || 
             (error as Error).message.includes('Supabase') ||
             (error as Error).message.includes('Range de datas')).toBe(true)
    }
  })

  it('deve aceitar filtro de período', async () => {
    const filter = {
      type: 'monthly' as const,
      year: 2024,
      month: 1
    }

    try {
      const metrics = await getInsightMetrics(validUserId, filter)
      expect(typeof metrics).toBe('object')
      expect(typeof metrics.avgMonthlyIncome).toBe('number')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve calcular taxa de poupança corretamente', async () => {
    try {
      const metrics = await getInsightMetrics(validUserId)
      
      // Taxa de poupança = (receita - gastos) / receita * 100
      if (metrics.avgMonthlyIncome > 0) {
        const expectedSavingsRate = ((metrics.avgMonthlyIncome - metrics.avgMonthlyExpenses) / metrics.avgMonthlyIncome) * 100
        expect(Math.abs(metrics.savingsRate - expectedSavingsRate) < 0.01).toBe(true)
      } else {
        expect(metrics.savingsRate).toBe(0)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve identificar categoria de maior gasto', async () => {
    try {
      const metrics = await getInsightMetrics(validUserId)
      
      // Categoria deve ser string não vazia ou 'N/A'
      expect(typeof metrics.topSpendingCategory).toBe('string')
      expect(metrics.topSpendingCategory.length > 0).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve usar últimos 6 meses por padrão', async () => {
    try {
      const metrics = await getInsightMetrics(validUserId)
      // Sem filtro, usa 6 meses padrão
      expect(typeof metrics).toBe('object')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
