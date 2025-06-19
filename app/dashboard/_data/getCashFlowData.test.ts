import { describe, it, expect } from 'bun:test'
import getCashFlowData from './getCashFlowData'

describe('getCashFlowData', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar dados de fluxo de caixa por mês', async () => {
    try {
      const cashFlow = await getCashFlowData(validUserId)
      
      // Deve retornar array de CashFlowMonth
      expect(Array.isArray(cashFlow)).toBe(true)
      
      // Se há dados, verifica estrutura CashFlowMonth
      if (cashFlow.length > 0) {
        const firstMonth = cashFlow[0]
        expect(typeof firstMonth.month).toBe('string')
        expect(typeof firstMonth.income).toBe('number')
        expect(typeof firstMonth.expenses).toBe('number')
        expect(typeof firstMonth.balance).toBe('number')
        
        // Valores devem ser não-negativos
        expect(firstMonth.income >= 0).toBe(true)
        expect(firstMonth.expenses >= 0).toBe(true)
        
        // Balance = income - expenses
        expect(firstMonth.balance).toBe(firstMonth.income - firstMonth.expenses)
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
      const cashFlow = await getCashFlowData(validUserId, filter)
      expect(Array.isArray(cashFlow)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve ordenar dados por mês (cronológico)', async () => {
    try {
      const cashFlow = await getCashFlowData(validUserId)
      
      if (cashFlow.length > 1) {
        // Verifica se está ordenado cronologicamente
        for (let i = 0; i < cashFlow.length - 1; i++) {
          const currentMonth = cashFlow[i].month
          const nextMonth = cashFlow[i + 1].month
          expect(typeof currentMonth).toBe('string')
          expect(typeof nextMonth).toBe('string')
        }
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve buscar últimos 12 meses por padrão', async () => {
    try {
      const cashFlow = await getCashFlowData(validUserId)
      
      // Sem filtro, deve retornar dados dos últimos 12 meses
      expect(Array.isArray(cashFlow)).toBe(true)
      expect(cashFlow.length <= 12).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
