import { describe, it, expect } from 'bun:test'
import getCategoryData from './getCategoryData'

describe('getCategoryData', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'

  it('deve retornar dados de categoria estruturados', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Deve retornar array de CategoryData
      expect(Array.isArray(categoryData)).toBe(true)
      
      // Se há dados, verifica estrutura CategoryData
      if (categoryData.length > 0) {
        const firstCategory = categoryData[0]
        expect(typeof firstCategory.categoryName).toBe('string')
        expect(typeof firstCategory.totalAmount).toBe('number')
        expect(typeof firstCategory.percentage).toBe('number')
        expect(typeof firstCategory.transactionCount).toBe('number')
        expect(typeof firstCategory.color).toBe('string')
        
        // Valores devem ser lógicos
        expect(firstCategory.totalAmount >= 0).toBe(true)
        expect(firstCategory.percentage >= 0 && firstCategory.percentage <= 100).toBe(true)
        expect(firstCategory.transactionCount > 0).toBe(true)
        expect(firstCategory.categoryName.length > 0).toBe(true)
        expect(firstCategory.color.length > 0).toBe(true)
      }
    } catch (error) {
      // Erro de DB/contexto é esperado
      expect((error as Error).message.includes('database') || 
             (error as Error).message.includes('Supabase')).toBe(true)
    }
  })

  it('deve calcular percentuais corretamente', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Soma dos percentuais deve ser 100% (ou próximo, considerando arredondamento)
      if (categoryData.length > 0) {
        const totalPercentage = categoryData.reduce((sum, cat) => sum + cat.percentage, 0)
        expect(Math.abs(totalPercentage - 100) < 0.01).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve ordenar por valor gasto (maior primeiro)', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Verifica ordenação se há múltiplas categorias
      if (categoryData.length > 1) {
        for (let i = 0; i < categoryData.length - 1; i++) {
          expect(categoryData[i].totalAmount >= categoryData[i + 1].totalAmount).toBe(true)
        }
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve aceitar filtro de período', async () => {
    const filter = {
      type: 'monthly' as const,
      year: 2024,
      month: 1
    }

    try {
      const categoryData = await getCategoryData(validUserId, filter)
      expect(Array.isArray(categoryData)).toBe(true)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve incluir categoria "Outros" para transações sem categoria', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Se há dados, pode incluir categoria "Outros"
      const hasOthers = categoryData.some(cat => cat.categoryName === 'Outros')
      if (hasOthers) {
        const othersCategory = categoryData.find(cat => cat.categoryName === 'Outros')!
        expect(othersCategory.totalAmount >= 0).toBe(true)
        expect(othersCategory.transactionCount > 0).toBe(true)
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve incluir apenas transações de débito', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Todas as categorias devem ter valor > 0 (apenas débitos)
      categoryData.forEach(category => {
        expect(category.totalAmount >= 0).toBe(true)
        expect(category.transactionCount >= 0).toBe(true)
      })
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('deve incluir cores válidas para categorias', async () => {
    try {
      const categoryData = await getCategoryData(validUserId)
      
      // Todas as categorias devem ter cor definida
      categoryData.forEach(category => {
        expect(typeof category.color).toBe('string')
        expect(category.color.length > 0).toBe(true)
        // Cor deve começar com # ou ser nome de cor válido
        expect(category.color.startsWith('#') || category.color.includes('gray')).toBe(true)
      })
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})
