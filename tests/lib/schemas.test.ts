/**
 * @fileoverview Testes para validação de schemas
 * @description Testes unitários para esquemas de validação de dados
 */

import { describe, it, expect } from 'bun:test'
import {
  validateUserId,
  validateTransactionQuery,
  validatePeriodFilter
} from '../app/dashboard/_data/schemas'
import {
  PeriodFilterSchema,
  DateRangeSchema,
  TransactionQuerySchema,
  DashboardStatsSchema,
  CategorySpendingSchema
} from '../app/dashboard/_data/schemas'

describe('Schemas Zod', () => {
  describe('PeriodFilterSchema', () => {
    it('deve validar filtro mensal válido', () => {
      const validFilter = { type: 'monthly', year: 2024, month: 0 }
      const result = PeriodFilterSchema.safeParse(validFilter)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('monthly')
        expect(result.data.year).toBe(2024)
        expect(result.data.month).toBe(0)
      }
    })

    it('deve validar filtro anual válido', () => {
      const validFilter = { type: 'yearly', year: 2024 }
      const result = PeriodFilterSchema.safeParse(validFilter)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe('yearly')
        expect(result.data.year).toBe(2024)
      }
    })

    it('deve validar filtro custom válido', () => {
      const validFilter = { type: 'custom' }
      const result = PeriodFilterSchema.safeParse(validFilter)
      
      expect(result.success).toBe(true)
    })

    it('deve rejeitar filtro mensal sem ano', () => {
      const invalidFilter = { type: 'monthly', month: 0 }
      const result = PeriodFilterSchema.safeParse(invalidFilter)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar filtro anual sem ano', () => {
      const invalidFilter = { type: 'yearly' }
      const result = PeriodFilterSchema.safeParse(invalidFilter)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar mês inválido', () => {
      const invalidFilter = { type: 'monthly', year: 2024, month: 12 }
      const result = PeriodFilterSchema.safeParse(invalidFilter)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar ano inválido', () => {
      const invalidFilter = { type: 'monthly', year: 1800, month: 0 }
      const result = PeriodFilterSchema.safeParse(invalidFilter)
      
      expect(result.success).toBe(false)
    })
  })

  describe('DateRangeSchema', () => {
    it('deve validar range de datas válido', () => {
      const validRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      }
      const result = DateRangeSchema.safeParse(validRange)
      
      expect(result.success).toBe(true)
    })

    it('deve rejeitar range com data final anterior à inicial', () => {
      const invalidRange = {
        start: new Date('2024-01-31'),
        end: new Date('2024-01-01')
      }
      const result = DateRangeSchema.safeParse(invalidRange)
      
      expect(result.success).toBe(false)
    })

    it('deve aceitar datas iguais', () => {
      const sameDate = new Date('2024-01-01')
      const validRange = { start: sameDate, end: sameDate }
      const result = DateRangeSchema.safeParse(validRange)
      
      expect(result.success).toBe(true)
    })
  })

  describe('TransactionQuerySchema', () => {
    it('deve validar query básica válida', () => {
      const validQuery = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      }
      const result = TransactionQuerySchema.safeParse(validQuery)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.includeCategories).toBe(false) // default
        expect(result.data.orderBy).toBe('date') // default
        expect(result.data.orderDirection).toBe('desc') // default
      }
    })

    it('deve validar query completa válida', () => {
      const validQuery = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        filter: { type: 'monthly', year: 2024, month: 0 },
        transactionType: 'credit',
        includeCategories: true,
        orderBy: 'amount',
        orderDirection: 'asc',
        limit: 50,
        offset: 10
      }
      const result = TransactionQuerySchema.safeParse(validQuery)
      
      expect(result.success).toBe(true)
    })

    it('deve rejeitar UUID inválido', () => {
      const invalidQuery = { userId: 'invalid-uuid' }
      const result = TransactionQuerySchema.safeParse(invalidQuery)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar limit muito alto', () => {
      const invalidQuery = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 2000
      }
      const result = TransactionQuerySchema.safeParse(invalidQuery)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar offset negativo', () => {
      const invalidQuery = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        offset: -5
      }
      const result = TransactionQuerySchema.safeParse(invalidQuery)
      
      expect(result.success).toBe(false)
    })
  })

  describe('DashboardStatsSchema', () => {
    it('deve validar stats válidas', () => {
      const validStats = {
        totalBalance: 1500.50,
        monthlyIncome: 3000,
        monthlyExpenses: 1500,
        transactionCount: 45,
        incomeChange: 12.5,
        expenseChange: -8.3,
        balanceChange: 25.0,
        transactionChange: 5.2
      }
      const result = DashboardStatsSchema.safeParse(validStats)
      
      expect(result.success).toBe(true)
    })

    it('deve rejeitar income negativa', () => {
      const invalidStats = {
        totalBalance: 1500,
        monthlyIncome: -100,
        monthlyExpenses: 1500,
        transactionCount: 45,
        incomeChange: 12.5,
        expenseChange: -8.3,
        balanceChange: 25.0,
        transactionChange: 5.2
      }
      const result = DashboardStatsSchema.safeParse(invalidStats)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar transactionCount não inteiro', () => {
      const invalidStats = {
        totalBalance: 1500,
        monthlyIncome: 3000,
        monthlyExpenses: 1500,
        transactionCount: 45.5,
        incomeChange: 12.5,
        expenseChange: -8.3,
        balanceChange: 25.0,
        transactionChange: 5.2
      }
      const result = DashboardStatsSchema.safeParse(invalidStats)
      
      expect(result.success).toBe(false)
    })
  })

  describe('CategorySpendingSchema', () => {
    it('deve validar categoria válida', () => {
      const validCategory = {
        id: 'cat-123',
        name: 'Alimentação',
        total: 500.75,
        percentage: 35.5,
        count: 12,
        color: '#FF5733',
        avgAmount: 41.73
      }
      const result = CategorySpendingSchema.safeParse(validCategory)
      
      expect(result.success).toBe(true)
    })

    it('deve rejeitar cor inválida', () => {
      const invalidCategory = {
        id: 'cat-123',
        name: 'Alimentação',
        total: 500.75,
        percentage: 35.5,
        count: 12,
        color: 'invalid-color',
        avgAmount: 41.73
      }
      const result = CategorySpendingSchema.safeParse(invalidCategory)
      
      expect(result.success).toBe(false)
    })

    it('deve rejeitar percentual acima de 100', () => {
      const invalidCategory = {
        id: 'cat-123',
        name: 'Alimentação',
        total: 500.75,
        percentage: 150,
        count: 12,
        color: '#FF5733',
        avgAmount: 41.73
      }
      const result = CategorySpendingSchema.safeParse(invalidCategory)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Funções de validação', () => {
    describe('validatePeriodFilter', () => {
      it('deve validar filtro válido', () => {
        const validFilter = { type: 'monthly', year: 2024, month: 0 }
        const result = validatePeriodFilter(validFilter)
        
        expect(result.type).toBe('monthly')
        expect(result.year).toBe(2024)
        expect(result.month).toBe(0)
      })

      it('deve lançar erro para filtro inválido', () => {
        const invalidFilter = { type: 'monthly' }
        
        expect(() => validatePeriodFilter(invalidFilter)).toThrow()
      })
    })

    describe('validateUserId', () => {
      it('deve validar UUID válido', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const result = validateUserId(validUuid)
        
        expect(result).toBe(validUuid)
      })

      it('deve lançar erro para UUID inválido', () => {
        const invalidUuid = 'invalid-uuid'
        
        expect(() => validateUserId(invalidUuid)).toThrow()
      })

      it('deve lançar erro para valor não string', () => {
        const notString = 123
        
        expect(() => validateUserId(notString)).toThrow()
      })
    })

    describe('validateTransactionQuery', () => {
      it('deve validar query válida', () => {
        const validQuery = {
          userId: '123e4567-e89b-12d3-a456-426614174000'
        }
        const result = validateTransactionQuery(validQuery)
        
        expect(result.userId).toBe(validQuery.userId)
        expect(result.includeCategories).toBe(false)
      })

      it('deve lançar erro para query inválida', () => {
        const invalidQuery = { userId: 'invalid' }
        
        expect(() => validateTransactionQuery(invalidQuery)).toThrow()
      })
    })
  })
}) 